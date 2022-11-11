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
            @change="onChang"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="作業站點">
          <el-select
            v-model="params.assignWorkStationId"
            multiple
            placeholder="請選擇"
          >
            <el-option
              v-for="item in workStations"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="加工單狀態">
          <el-select v-model="params.docStatus" multiple placeholder="請選擇">
            <el-option
              v-for="item in processingStatus"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="加工單號碼">
          <el-input v-model="params.sysOrderNo"></el-input>
        </el-form-item>

        <el-form-item label="料品號">
          <el-input v-model="params.prodCode"></el-input>
        </el-form-item>

        <el-divider class="form-divider"></el-divider>

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 分頁 -->
    <el-row type="flex">
      <el-col :span="8">
        <div type="flex">
          <el-button type="primary">執行批次生效</el-button>
          <el-button type="primary">自動叫單生效</el-button>
        </div>
      </el-col>
      <el-col :span="16" align="end">
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
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="加工單號碼"
        prop="sysOrderNo"
        width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="料品號"
        prop="prodCode"
        sortable="custom"
        min-width="180"
      >
      </el-table-column>
      <el-table-column
        label="供應商"
        prop="supplier"
        sortable="custom"
        width="100"
      >
      </el-table-column>
      <el-table-column
        label="數量"
        prop="totalProcQty"
        sortable="custom"
        width="100"
      >
      </el-table-column>
      <el-table-column
        label="單據狀態"
        prop="docStatus"
        sortable="custom"
        width="120"
      >
      </el-table-column>
      <el-table-column
        label="綁定站點"
        prop="statusName"
        sortable="custom"
        width="120"
      >
      </el-table-column>
      <el-table-column label="動作" width="200" align="center">
        <template slot-scope="scope">
          <el-button @click="onAction(scope.row)" size="mini" type="primary"
            >生效
          </el-button>
          <el-button @click="onAction(scope.row)" size="mini">失效 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import moment from "moment";
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getProcesses } from "@/api/processing";
import { SelectTypeEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      content: [],
      workStations: [],
      nowDate: [],
      params: {
        direction: "ASC",
        docStatus: 0,
        page: 1,
        prodCode: "",
        properties: "id",
        receivedEndDate: "",
        receivedStartDate: "",
        size: 50,
        stationId: "",
        sysOrderNo: "",
      },
      processingStatus: [],
    };
  },
  created() {
    this.nowDate.push(this.addDay(-7));
    this.nowDate.push(this.addDay(0));

    this.getSelector(SelectTypeEnum.WORK_STATION).then((resp) => {
      this.workStations = resp;
    });

    this.getSelector(SelectTypeEnum.PROCESSING_STATUS).then((resp) => {
      this.processingStatus = resp;
    });
  },
  methods: {
    onLoad() {
      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);
      getProcesses(query).then((respone) => {
        console.log(respone);
        if (respone.status == "OK") {
          this.content = respone.message.content;
          console.log(respone);
          // 分頁設定
          this.setPagination(respone.message);
          // 處理項次
          for (let item of this.content) {
            this.page.seq++;
            item.seq = this.page.seq;
          }
        }
      });
    },
    onChang(val) {
      const diff = moment(val[1]).diff(val[0], "days");
      if (diff > 60) {
        val[0] = this.addDay(-7);
        val[1] = this.addDay(0);
        this.warning("日期查詢間隔勿超過60天");
      }
    },
    onAction(val) {},
    async onSortcChange(val) {
      if (val.order == null) {
        return;
      }
      this.params.direction = val.order == "ascending" ? "ASC" : "DESC";
      this.params.properties = val.prop;
      await this.onLoad();
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
  },
};
</script>
