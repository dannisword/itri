<template>
  <el-container
    v-loading="loading.isLoading"
    :element-loading-text="loading.message"
  >
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
              @change="onDatePickeChang"
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
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="入庫單狀態">
            <el-select v-model="params.docStatus" multiple placeholder="請選擇">
              <el-option
                v-for="item in inStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="收單來源">
            <el-select
              v-model="params.receiveSource"
              multiple
              placeholder="請選擇"
            >
              <el-option
                v-for="item in inSource"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="入庫單號碼">
            <el-input v-model="params.refNo"></el-input>
          </el-form-item>

          <el-form-item label="事務號">
            <el-input v-model="params.transNo"></el-input>
          </el-form-item>

          <el-form-item label="料品號">
            <el-input v-model="params.prodCode"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="onLoad()">查詢</el-button>
          </el-form-item>

          <el-divider class="form-divider"></el-divider>
        </el-form>
      </div>

      <!-- 分頁 -->
      <el-row class="mt-1" type="flex">
        <el-col :span="16">
          <el-form class="mt-1" label-width="140px" :inline="true">
            <el-form-item label="請輸入操作單號">
              <el-input v-model="docNo" placeholder="請輸入操作單號">
                <el-button
                  slot="append"
                  icon="el-icon-plus"
                  @click="getProcessAssign"
                >
                </el-button>
              </el-input>
            </el-form-item>
            <el-form-item> </el-form-item>
            入庫最新收單時間：{{
              receiveInfo.lastDateTime
            }}
            入庫最新收單數量：{{ receiveInfo.lastCount }}單
          </el-form>
        </el-col>
        <el-col :span="8" align="end">
          <el-pagination
            background
            @current-change="onCurrentChange"
            :current-page="page.number"
            :page-size="page.size"
            layout="total,jumper,prev,pager,next"
            :total="page.totalElements"
          ></el-pagination>
        </el-col>
      </el-row>

      <!-- 資料 -->
      <el-table
        :data="content"
        class="table-container"
        border
        stripe
        @sort-change="onSortcChange"
        @cell-dblclick="ondblClick"
      >
        <el-table-column label="項次" width="100" prop="seq" fixed>
        </el-table-column>
        <el-table-column
          label="收單來源"
          prop="receiveSource"
          width="180"
          sortable="custom"
        >
        </el-table-column>
        <el-table-column
          label="入庫單號碼"
          prop="refNo"
          min-width="180"
          sortable="custom"
        >
        </el-table-column>

        <el-table-column
          label="事務號"
          prop="transNo"
          min-width="125"
          sortable="custom"
        >
        </el-table-column>

        <el-table-column
          label="料品號"
          prop="prodCode"
          min-width="125"
          sortable="custom"
        >
        </el-table-column>
        <el-table-column
          label="供應商"
          prop="supplier"
          min-width="125"
          sortable="custom"
        >
        </el-table-column>
        <el-table-column
          label="收料數量"
          prop="totalPlanQty"
          width="125"
          sortable="custom"
        >
        </el-table-column>
        <el-table-column
          label="入庫單狀態"
          prop="docStatusName"
          width="125"
          sortable="custom"
        >
        </el-table-column>
        <el-table-column
          label="綁定站點"
          prop="assignWorkStationId"
          width="125"
          sortable="custom"
        >
        </el-table-column>
      </el-table>
    </div>
  </el-container>
</template>
<script>
import Dialog from "@/components/ModalDialog/Dialog.vue";
import pageMixin from "@/utils/mixin";
import { getInbounds, startInbound } from "@/api/inbound";
import { getReceiveInfo } from "@/api/system";
import { SelectTypeEnum, RunModelEnum } from "@/utils/enums/index";
import { getProcessDocs, getProcessAssign } from "@/api/processing";

export default {
  components: {
    Dialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: {
        isLoading: false,
        message: "載入中，請稍候...",
      },
      content: [],
      workStations: [],
      nowDate: [],
      receiveInfo: {},
      docs: [],
      docNo: "",
      params: {
        assignWorkStationId: "",
        direction: "DESC",
        docStatus: [0, 2],
        page: 1,
        prodCode: "",
        properties: "docStatus",
        receivedEndDateTime: "",
        receivedStartDateTime: "",
        receiveSource: [],
        refNo: "", // 移轉單號
        size: 50,
        sysOrderNo: "", // 入庫單號
        transNo: "", // 事務單號
      },
      inStatus: [],
      inSource: [],
    };
  },
  async created() {
    //this.loading.isLoading = true;
    this.nowDate.push(this.addDay(-30));
    this.nowDate.push(this.addDay(0));
    // 作業站點
    this.workStations = await this.getSelector(SelectTypeEnum.WORK_STATION);
    // 入庫單狀態
    this.inStatus = await this.getSelector(SelectTypeEnum.INBOUND_STATUS);
    // 收單來源
    this.inSource = await this.getSelector(SelectTypeEnum.INBOUND_SOURCE);
    // 站點綁定
    if (this.workStation().length > 0) {
      this.params.assignWorkStationId.push(this.workStation());
    }
    // 入庫資訊
    getReceiveInfo("入庫").then((resp) => {
      if (resp.status == "OK") {
        this.receiveInfo = resp.message;
      }
    });

    await this.onLoad();
    this.loading.isLoading = false;
  },
  methods: {
    onLoad() {
      this.loading.isLoading = true;
      this.loading.message = "載入中，請稍候...";
      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params, false);
      getInbounds(query)
        .then((respone) => {
          if (respone.message) {
            this.content = respone.message.content;
            // 分頁設定
            this.setPagination(respone.message);
            // 處理項次
            for (let item of this.content) {
              this.page.seq++;
              item.seq = this.page.seq;
            }
            this.loading.isLoading = false;
          }
        })
        .catch((e) => {
          this.loading.isLoading = false;
        });
    },
    async onSortcChange(val) {
      if (val.order == null) {
        return;
      }
      let prop = val.prop;
      if (prop == "docStatusName") {
        prop = "docStatus";
      }
      this.params.direction = val.order == "ascending" ? "ASC" : "DESC";
      this.params.properties = prop;
      await this.onLoad();
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
    async ondblClick(val) {
      // 唯讀模式
      if (this.isReadOnly() == true) {
        this.onNav(`/TND2100/${val.id}`);
        return;
      }
      // 確認作業模式
      if (this.currentModel().id != 0 && this.currentModel().id != 1) {
        this.warning("請切換作業模式");
        //return;
      }
      this.loading.isLoading = true;
      this.loading.message = "配箱中，請稍候...";

      startInbound(val.sysOrderNo)
        .then((resp) => {
          if (resp.status == "OK") {
            this.onNav(`/TND2100/${val.id}`);
          }
          this.loading.isLoading = false;
        })
        .catch((e) => {
          this.loading.isLoading = false;
        });
    },
    handleOnReConnect() {
      this.retryTimes += 1;
      if (this.retryTimes > 5) {
        try {
          this.client.end();

          //this.initData();
          //this.$message.error("Connection maxReconnectTimes limit, stop retry");
        } catch (error) {
          this.$message.error(error.toString());
        }
      }
    },
    getProcessAssign() {
      if (this.docNo.length <= 0) {
        this.warning("請輸入加工單號碼!");
        return;
      }
      /*
      const data = this.docs.filter((x) => x.value == this.docNo);
      if (data.length <= 0) {
        this.warning("查無此加工單號碼!");
        return;
      }*/
      getProcessAssign("IN", this.docNo).then((resp) => {
        console.log(resp);
      });
    },
    createFilter(val) {
      return (resp) => {
        return resp.value.toLowerCase().indexOf(val.toLowerCase()) === 0;
      };
    },
  },
};
</script>
<style></style>
