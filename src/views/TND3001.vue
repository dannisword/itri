<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="100px" :inline="true">
        <el-form-item label="收單日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="作業站點">
          <el-select
            v-model="params.assignWorkStationId"
            multiple
            placeholder="請選擇"
            :disabled="workStation().length > 0"
          >
            <el-option
              v-for="item in workStations"
              :key="item.id"
              :label="item.id"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="出庫單狀態">
          <el-select v-model="params.docStatus" multiple placeholder="請選擇">
            <el-option
              v-for="item in outStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="出貨模式">
          <el-select v-model="params.docType" multiple placeholder="請選擇">
            <el-option
              v-for="item in outSource"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="出庫單號碼">
          <el-input v-model="params.sysOrderNo"></el-input>
        </el-form-item>

        <el-form-item label="料品號">
          <el-input v-model="params.prodCode"></el-input>
        </el-form-item>
        <!-- 
        <el-divider class="form-divider"></el-divider>
        -->

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 分頁 -->
    <el-row class="mt-1" type="flex">
      <el-col :span="10">
        出庫最新收單時間：{{ receiveInfo.lastDateTime }} 出庫最新收單數量：{{
          receiveInfo.lastCount
        }}單
      </el-col>
      <el-col :span="14" align="end">
        <el-pagination
          background
          @current-change="onCurrentChange"
          :current-page="page.number"
          :page-size="page.size"
          layout="total,jumper,prev, pager, next"
          :total="page.totalElements"
        ></el-pagination>
      </el-col>
    </el-row>

    <!-- 資料-->
    <el-table
      :data="content"
      v-loading="loading"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
      @cell-dblclick="ondblClick"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="出貨模式"
        prop="docType"
        min-width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="出庫單號碼"
        prop="sysOrderNo"
        min-width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="料品號"
        prop="prodCode"
        min-width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="供應商"
        prop="supplier"
        sortable="custom"
        min-width="180"
      >
      </el-table-column>
      <el-table-column
        label="數量"
        prop="totalPlanQty"
        sortable="custom"
        min-width="100"
      >
      </el-table-column>
      <el-table-column
        label="出庫單狀態"
        prop="docStatusName"
        sortable="custom"
        min-width="180"
      >
      </el-table-column>
      <el-table-column
        label="綁定站點"
        prop="assignWorkStationId"
        sortable="custom"
        min-width="180"
      >
      </el-table-column>
      <!-- 
      <el-table-column label="動作" width="200" align="center">
        <template slot-scope="scope">
          <el-button @click="onAction(scope.row)" size="mini" type="primary"
            >生效
          </el-button>
          <el-button @click="onAction(scope.row)" size="mini">失效 </el-button>
        </template>
      </el-table-column>
    -->
    </el-table>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getWorkStations } from "@/api/workStation";
import { getOutBounds, getOutBoundDetail, startOutbound } from "@/api/outbound";
import { SelectTypeEnum } from "@/utils/enums/index";
import { getReceiveInfo } from "@/api/system";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      receiveInfo: "",
      content: [],
      workStations: [],
      nowDate: [],
      outStatus: [],
      outSource: [],
      params: {
        assignWorkStationId: [],
        direction: "ASC",
        docStatus: 0,
        docType: "0",
        page: 1,
        prodCode: "",
        properties: "id",
        receivedEndDateTime: "",
        receivedStartDateTime: "",
        size: 50,
        sysOrderNo: "",
      },
    };
  },
  async created() {
    // TODO -7
    this.nowDate.push(this.addDay(-30));
    this.nowDate.push(this.addDay(0));
    getWorkStations().then((resp) => {
      if (resp.message) {
        this.workStations = resp.message;
      }
    });

    this.outStatus = await this.getSelector(SelectTypeEnum.OUTBOUND_STATUS);

    this.outSource = await this.getSelector(SelectTypeEnum.SHIPPING_MODE);
    // 站點綁定
    if (this.workStation().length > 0) {
      this.params.assignWorkStationId.push(this.workStation());
    }
    // 出庫資訊
    getReceiveInfo("出庫").then((resp) => {
      if (resp.status == "OK") {
        this.receiveInfo = resp.message;
      }
    });

    this.onLoad();
  },
  methods: {
    onLoad() {
      this.loading = true;
      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);

      getOutBounds(query)
        .then((respone) => {
          if (respone.status == "OK") {
            this.content = respone.message.content;

            // 分頁設定
            this.setPagination(respone.message);
            // 處理項次
            for (let item of this.content) {
              this.page.seq++;
              item.seq = this.page.seq;
            }
            this.loading = false;
          }
        })
        .catch((e) => {
          this.loading = false;
        });

      // A4-2 取得出庫單明細
    },
    onAction(val) {},
    onSizeChange(val) {},
    async onSortcChange(val) {
      if (val.order == null) {
        return;
      }
      this.params.direction = val.order == "ascending" ? "ASC" : "DESC";
      this.params.properties = val.prop;
      await this.onLoad();
    },
    ondblClick(val) {
      console.log(val)
      startOutbound(val.sysOrderNo).then((resp) => {
        if (resp.title == "successful") {
          this.onNav(`/TND3100/${val.id}`);
        }
      });
    },
    onCurrentChange(val) {},
  },
};
</script>
