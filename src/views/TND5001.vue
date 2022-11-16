<template>
  <div class="app-container">
    <div class="form-container">
      <!-- 查詢條件 -->
      <el-form :model="params" label-width="100px" :inline="true">
        <el-form-item label="盤點日期">
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
            v-model="params.workStnCode"
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

        <el-form-item label="盤點單狀態">
          <el-select v-model="params.docStatus" multiple placeholder="請選擇">
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="盤點類型">
          <el-select v-model="params.type" multiple placeholder="請選擇">
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="盤點單號碼">
          <el-input v-model="params.sysOrderNo"></el-input>
        </el-form-item>

        <el-form-item label="料品號">
          <el-input v-model="params.prodCode"></el-input>
        </el-form-item>
        <!--        <el-divider class="form-divider"></el-divider> -->

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
          <el-button
            type="success"
            @click="onAdd()"
            :disabled="currentModel() != 4"
            >新增盤點單</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 分頁 -->
    <el-row type="flex">
      <el-col :span="8"> </el-col>
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

    <!-- 盤點資料-->
    <el-table
      :data="content"
      v-loading="loading"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
      @cell-dblclick="ondblClick"
    >
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="盤點單號碼"
        prop="sysOrderNo"
        sortable="custom"
        min-width="200"
        fixed
      >
      </el-table-column>
      <el-table-column
        label="單據狀態"
        prop="docStatusLabel"
        width="130"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="盤點類型"
        prop="type"
        width="130"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="盤點時間"
        prop="inventoryDate"
        width="180"
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
        label="有複盤單"
        prop="hasChild"
        width="130"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.hasChild | formatEmpty }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="有異動單"
        prop="hasAdjust"
        width="130"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.hasAdjust | formatEmpty }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="綁定站點"
        prop="assignWorkStationId"
        width="130"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column label="動作" width="200" align="center">
        <template slot-scope="scope">
          <div v-if="currentModel() == 4">
            <el-button
              @click="onEffect(scope.row)"
              size="mini"
              type="primary"
              :disabled="scope.row.docStatus > 0"
              >生效
            </el-button>
            <el-button
              @click="onInvalid(scope.row)"
              size="mini"
              :disabled="scope.row.docStatus > 2"
              >失效
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getWorkStation } from "@/api/workStation";
import { getInventories, setInvEffect, setInvInvalid } from "@/api/inventory";
import { SelectTypeEnum, InvDocStatusEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      content: [],
      workStations: [],
      nowDate: [],
      params: {
        direction: "ASC",
        docNo: "",
        docStatus: [],
        endDate: "",
        page: 1,
        prodCode: "",
        properties: "sysOrderNo",
        size: 50,
        startDate: "",
        type: [],
        workStnCode: [],
      },
      status: [],
      types: [],
    };
  },
  computed: {},
  created() {
    this.nowDate.push(this.addDay(-7));
    this.nowDate.push(this.addDay(0));
    getWorkStation().then((resp) => {
      if (resp.message) {
        this.workStations = resp.message;
      }
    });
    this.getSelector(SelectTypeEnum.INVENTORY_STATUS).then((resp) => {
      this.status = resp;
    });
    this.getSelector(SelectTypeEnum.INVENTORY_TYPE).then((resp) => {
      this.types = resp;
    });
    if (this.workStation().length > 0) {
      this.params.workStnCode.push(this.workStation());
    }
    //
    console.log(this.currentModel());

    this.onLoad();
  },
  methods: {
    onLoad() {
      this.loading = true;
      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);

      getInventories(query)
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
            setTimeout(() => {
              this.loading = false;
            }, 300);
          }
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    onAdd() {
      this.onNav("TND5103");
    },
    onEffect(val) {
      setInvEffect(val.sysOrderNo).then((resp) => {
        if (resp.status != "OK") {
          this.warning(resp.errorMessage);
          return;
        }
        if (resp.message == false) {
          this.warning(`設定 ${val.sysOrderNo}盤點單失敗！`);
        } else {
          this.success(`設定 ${val.sysOrderNo}盤點單已生效！`);
        }
        this.onLoad();
      });
    },
    onInvalid(val) {
      //狀態(0:還原, 2:工作執行中, 5:失效)
      setInvInvalid(val.sysOrderNo, 5).then((resp) => {
        if (resp.status != "OK") {
          this.warning(`設定 ${val.sysOrderNo}盤點單失敗！`);
          return;
        }
        if (resp.message == false) {
          this.warning(`設定 ${val.sysOrderNo}盤點單失敗！`);
        } else {
          this.success(`設定 ${val.sysOrderNo}盤點單已失效！`);
        }
        this.onLoad();
      });
    },
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
    ondblClick(val) {
      if (
        val.docStatus == InvDocStatusEnum.Received ||
        val.docStatus == InvDocStatusEnum.Invalid
      ) {
        return;
      }
      console.log(val);
      // 已生效, 已完成
      let url = "";
      if (
        val.docStatus == InvDocStatusEnum.Progress ||
        val.docStatus == InvDocStatusEnum.Completed
      ) {
        url = `/TND5100/1/${val.id}`;
      }
      // 完成
      if (val.docStatus == InvDocStatusEnum.Finished) {
        url = `/TND5101/2/${val.id}`;
      }

      if (val.docStatus == InvDocStatusEnum.Completed) {
        //url = `/TND5102/3/${val.id}`;
      }
      this.onNav(url);
    },
  },
};
</script>
