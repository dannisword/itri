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
          <!-- :disabled="currentModelId() != 4" -->
          <el-button type="success" @click="onAdd()">新增盤點單</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 分頁 -->
    <el-row type="flex" class="mt-1">
      <el-col :span="16">
        盤點最新收單時間：{{ receiveInfo.lastDateTime }} 盤點最新收單數量：{{
          receiveInfo.lastCount
        }}單
      </el-col>
      <el-col :span="8" align="end">
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
        fixed
      >
      </el-table-column>
      <el-table-column
        label="單據狀態"
        prop="docStatus"
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
      <!-- 
      <el-table-column label="動作" width="200" align="center">
        <template slot-scope="scope">
          <div v-if="currentModelId() == 4">
            <el-button
              @click="onEffect(scope.row)"
              size="mini"
              type="primary"
              v-if="canEffectAction(scope.row)"
              >生效
            </el-button>
            <el-button
              @click="onInvalid(scope.row)"
              size="mini"
              v-if="canInvalidAction(scope.row)"
              >失效
            </el-button>

            <el-button
              @click="onReduction(scope.row)"
              size="mini"
              v-if="canReductionAction(scope.row)"
              >還原
            </el-button>
          </div>
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
import { getInventories, setInvEffect, setInvInvalid } from "@/api/inventory";
import { SelectTypeEnum, InvDocStatusEnum } from "@/utils/enums/index";
import { getReceiveInfo } from "@/api/system";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      receiveInfo: {},
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
    getWorkStations().then((resp) => {
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
    // 站點綁定
    if (this.workStation().length > 0) {
      this.params.workStnCode.push(this.workStation());
    }
    // 入庫資訊
    getReceiveInfo("盤點").then((resp) => {
      console.log(resp);
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
        if (resp.status == "OK") {
          if (resp.message == false) {
            this.warning(`設定生效，${val.sysOrderNo}盤點單失敗！`);
          } else {
            this.onNav(`/TND5100/0/${val.id}`);
          }
        }
      });
    },
    onInvalid(val) {
      //狀態(0:還原, 2:工作執行中, 5:失效)
      setInvInvalid(val.sysOrderNo, 5).then((resp) => {
        if (resp.status == "OK") {
          if (resp.message == false) {
            this.warning(`設定失效，${val.sysOrderNo}盤點單失敗！`);
          } else {
            this.success(`設定失效，${val.sysOrderNo}盤點單成功！`);
          }
        }
        this.onLoad();
      });
    },
    onReduction(val) {
      setInvInvalid(val.sysOrderNo, 0).then((resp) => {
        if (resp.status == "OK") {
          if (resp.message == false) {
            this.warning(`設定還原，${val.sysOrderNo}盤點單失敗！`);
          } else {
            this.success(`設定還原，${val.sysOrderNo}盤點單成功！`);
          }
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
      let url = "";
      if (val.type == "初盤") {
        url = `/TND5100/1/${val.id}`;
      }
      if (val.type == "複盤") {
        url = `/TND5100/1/${val.id}`;
      }
      if (val.docStatus == InvDocStatusEnum.Received) {
        setInvEffect(val.sysOrderNo).then((resp) => {
          if (resp.title == "successful") {
            this.onNav(url);
          }
        });
        return;
      }
      this.onNav(url);
      return;
      //#region  原需求
      if (
        val.docStatus == InvDocStatusEnum.Received ||
        val.docStatus == InvDocStatusEnum.Invalid
      ) {
        return;
      }
      //let url = "";
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
      //#endregion
    },
    canEffectAction(row) {
      return row.docStatus == InvDocStatusEnum.Received;
    },
    canInvalidAction(row) {
      return row.docStatus == InvDocStatusEnum.Received;
    },
    canReductionAction(row) {
      return row.docStatus == InvDocStatusEnum.Invalid;
    },
  },
};
</script>
