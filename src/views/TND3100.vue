<template>
  <div class="app-container">
    <el-form :model="params" label-width="100px" :inline="true">
      <el-form-item label="出庫單狀態">
        <el-input v-model="outbound.docStatusName" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND3001')">回列表</el-button>
    </el-form>

    <el-row type="flex" class="row-bg" justify="end">
      <el-col>
        <el-button type="primary" @click="onOpenLog">
          物流箱進度查詢({{ info.total }})
        </el-button>
      </el-col>
      <el-col> </el-col>
      <el-col>
        尚有{{ info.lastCount }}筆工作
        <el-button
          type="success"
          @click="onClose()"
          :disabled="isFinished == true || isReadOnly() == true"
        >
          結束此單作業
        </el-button>
      </el-col>
    </el-row>

    <!-- 主檔 -->
    <el-table :data="outbounds" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="出庫單號碼" prop="refNo" min-width="180">
      </el-table-column>
      <el-table-column label="料品號" prop="prodCode" min-width="180">
      </el-table-column>
      <el-table-column label="供應商" prop="supplierProdCode">
      </el-table-column>
      <el-table-column label="訂購數量" prop="totalPlanQty" width="125">
      </el-table-column>
      <el-table-column label="實際已揀總數" prop="totalProdQty" width="125">
      </el-table-column>
    </el-table>
    <!-- 條碼 -->
    <el-row>
      <el-col :span="18">
        <el-form class="mt-1" label-width="180px" :inline="true">
          <el-form-item label="請刷讀物流箱編號條碼">
            <el-input
              v-model="carrierId"
              :disabled="isFinished == true || isReadOnly() == true"
              @keyup.enter.native="setBarcode(carrierId)"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6" type="flex" justify="end">
        <el-form class="mt-1" :inline="false">
          <el-form-item>
            <el-button
              type="primary"
              @click="onCallback()"
              :disabled="this.carrierId.length <= 0"
            >
              料盒連動測試
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <!-- 資料-->
    <el-table :data="details" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="物流箱編號" prop="carrierId" min-width="180">
      </el-table-column>
      <el-table-column label="物流箱內數量" prop="stockQty" min-width="180">
      </el-table-column>
      <el-table-column label="應揀數量" prop="planQty" min-width="180">
      </el-table-column>
      <el-table-column label="已揀數量" prop="prodQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.prodQty"
            :disabled="scope.row.prodQtyEdit == false"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onProdQtyEdit(scope.row)">{{
              scope.row.prodQtyEditName
            }}</el-button>
          </el-input>
          <span v-else>{{ scope.row.prodQty }}</span>
        </template>
      </el-table-column>

      <el-table-column label="輸入已揀數量" prop="outQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.outQty"
            min="0"
            @keyup.enter.native="onAddProdQty(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onAddProdQty(scope.row)"
              >加總數量</el-button
            >
          </el-input>
        </template>
      </el-table-column>

      <el-table-column label="帳差" prop="differenceQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.differenceQty"
            v-if="scope.row.isFinished == false"
          >
          </el-input>
          <span v-else>{{ scope.row.differenceQty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="動作" prop="statusName" width="280">
        <template slot-scope="scope">
          <el-row v-if="scope.row.isFinished == false">
            <el-button @click="onRemove(scope.row)" size="mini" type="danger"
              >取下
            </el-button>
            <el-button
              @click="onFinish(scope.row)"
              size="mini"
              type="primary"
              :disabled="scope.row.prodQty <= 0"
              >放置完成，送回
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>

    <ModalDialog
      :title="dialogs.log.title"
      :name="dialogs.log.name"
      :visible.sync="dialogs.log.visible"
      @afterClosed="onModalClose"
      :optional="Large"
    >
      <el-row :gutter="20">
        <!-- TODO
        <el-col :span="6"> 站點：{{ workStation() }} </el-col>
        -->
        <el-col :span="6"> 站點：{{ outbound.assignWorkStationId }} </el-col>
      </el-row>
      <el-row class="mt-1" :gutter="20">
        <el-col :span="20"> 出庫單號碼：{{ outbound.refNo }} </el-col>
      </el-row>
      <el-table
        :data="carrierRecords"
        class="table-container"
        border
        stripe
        height="400px"
      >
        <el-table-column label="項次" prop="seq" fixed> </el-table-column>
        <el-table-column
          label="物流箱編號"
          prop="carrierId"
          min-width="160"
          fixed
        >
        </el-table-column>
        <el-table-column label="命令型態名稱" prop="opTypeName" min-width="160">
        </el-table-column>
        <el-table-column label="收到指令時間" prop="createTime" min-width="180">
        </el-table-column>
        <el-table-column label="完成指令時間" prop="finishTime" min-width="180">
        </el-table-column>
      </el-table>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import mqtt_message from "@/utils/mixin/mqtt_message";
import { SelectTypeEnum } from "@/utils/enums/index";
import {
  getOutbound,
  getOutBoundDetail,
  setOutBoundDetail,
  takeOutBoundDetail,
  closeOutbound,
  callOutbound,
} from "@/api/outbound";

import {
  getReceiveInfo,
  carrierArrived,
  getCarrierArrived,
} from "@/api/system";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin, mqtt_message],
  data() {
    return {
      funcName: "執行出庫工作",
      info: {
        lastCount: 0,
        part: 0,
        total: 0,
      },
      lastCount: 0,
      carrierId: "",
      outbound: {},
      outbounds: [],
      details: [],
      outStatus: [],
      carrierRecords: [],
      params: {
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
      dialogs: {
        log: {
          title: "物流箱進度查詢",
          name: "LOG",
          visible: false,
        },
      },
    };
  },
  computed: {
    isFinished() {
      // 判斷主檔
      return this.outbound.docStatus >= 3 ? true : false;
    },
    canClose() {
      const dts = this.details.filter((x) => x.isFinished == false);
      return dts.length > 0 ? false : true;
    },
  },
  async created() {
    this.outStatus = await this.getSelector(SelectTypeEnum.OUTBOUND_STATUS);
    // 站點綁定
    if (this.workStation().length > 0) {
      // mqtt connect
      this.connect(this.funcName);
      this.client.on("message", this.handleMqtt);
    }
    await this.onLoad();
    //await this.handleFlow();
  },
  methods: {
    onLoad() {
      const outboundId = this.$route.params.id;
      this.outbound = {};
      this.outbounds = [];

      getOutbound(outboundId).then((resp) => {
        if (resp.title == "successful") {
          for (let item of resp.message) {
            item.seq = 1;
          }
          this.outbounds = resp.message;
          this.outbound = this.outbounds[0];
          // A4-27 carrierId 帶空值
          this.setBarcode("empty");
          this.handleFlow();
        }
      });
      //this.getOutBoundDetail(outboundId);
    },
    onRemove(val) {
      takeOutBoundDetail(val).then((resp) => {
        console.log(resp);
      });
    },
    async onClose() {
      if (this.canClose == false) {
        this.warning("出庫工作，尚未完成，請完成放置，回送！");
        return;
      }
      if (this.outbound.totalProdQty <= 0) {
        let isConfirm = await this.confirm("實際已揀總數小於0，是否結束此單！");
        if (isConfirm == false) {
          return;
        }
      }

      const resp = await closeOutbound(this.outbound.sysOrderNo);
      if (resp.title == "successful") {
        this.onNav("/TND3001");
      } else {
        this.warning(resp.message);
      }
    },
    onFinish(val) {
      val.isFinished = true;
      this.setOutBoundDetail(val);
    },
    onProdQtyEdit(val) {
      if (val.prodQty == null || val.prodQty.length <= 0) {
        val.prodQtyEdit = true;
        val.prodQtyEditName = "存檔";
        this.warning("請輸入數量");
        return;
      }
      val.prodQtyEdit = !val.prodQtyEdit;
      val.prodQtyEditName = "編輯";
      if (val.prodQtyEdit == true) {
        val.prodQtyEditName = "存檔";
      } else {
        this.setOutBoundDetail(val);
      }
    },
    onAddProdQty(val) {
      val.prodQtyEdit = false;
      val.prodQtyEditName = "編輯";

      if (val.outQty == "") {
        this.warning("請輸入數量");
        return;
      }
      val.prodQty = parseFloat(val.outQty) + parseFloat(val.prodQty);
      val.outQty = "";
    },
    onOpenLog() {
      this.dialogs.log.visible = true;
      this.Large.showAction = false;
      const params = {
        docNo: this.outbound.sysOrderNo,
        workStn: this.workStation(),
      };
      const query = this.getQuery(params);
      getCarrierArrived(query).then((resp) => {
        if (resp.title == "successful") {
          this.carrierRecords = resp.message.content;
          let seq = 1;
          for (let item of this.carrierRecords) {
            item.seq = seq++;
          }
        }
      });
      this.handleFlow();
    },
    onModalClose(val) {
      this.dialogs.log.visible = false;
    },
    setBarcode(carrierId) {
      callOutbound(this.outbound.sysOrderNo, carrierId).then((resp) => {
        if (resp.title != "successful") {
          this.warning(resp.message);
        } else {
          this.details = resp.message;
          let seq = 1;
          for (let detail of this.details) {
            detail.seq = seq++;
            detail.outQty = "";
          }
          this.details.sort(function (a, b) {
            if (a.isFinished == true) {
              return 0;
            }
            return -1;
          });
        }
      });
    },
    onCallback() {
      this.carrierCallback(this.carrierId);
    },
    //A4-11 回報單據明細出庫資料(編輯/放置完成，回送)
    setOutBoundDetail(detail) {
      setOutBoundDetail(detail).then((resp) => {
        if (resp.title == "successful") {
          this.onLoad();
        }
      });
    },
    getOutBoundDetail(outboundId) {
      this.details = [];
      // A4-2 取得出庫單明細
      getOutBoundDetail(outboundId).then((resp) => {
        if (resp.title == "successful") {
          this.details = resp.message;
          let seq = 1;
          for (let detail of this.details) {
            detail.seq = seq++;
            detail.outQty = "";
          }
          this.details.sort(function (a, b) {
            if (a.isFinished == true) {
              return 0;
            }
            return -1;
          });
        }
      });
    },
    async handleFlow() {
      // A1-44
      let resp;
      this.info.lastCount = 0;
      this.info.part = 0;
      this.info.total = 0;
      resp = await getReceiveInfo("出庫");
      if (resp.title == "successful") {
        this.info.lastCount =
          resp.message.lastCount == null ? 0 : resp.message.lastCount;
      }
      // A1-46 I,O,PR,IN
      resp = await carrierArrived(this.outbound.sysOrderNo, "出庫");
      if (resp.title == "successful") {
        this.info.part = resp.message.part;
        this.info.total = resp.message.total;
      } else {
        // 07250002.1
        this.warning(resp.message);
      }
      // A4-23
      //await this.onLoad();
      // A4-3
    },
    handleMqtt(topic, message) {
      const val = JSON.parse(message);
      const dt = Date(); //this.toDateTime(Date());
      const sub = `[${this.funcName} (${dt})] subscribe to topics ${topic}`;
      console.log(sub);
      console.log(message.toString());
      const mode = this.carrierMap(val.sensor);
      if (mode == "IN") {
        this.carrierId = val.carrier;
        this.setBarcode(this.carrierId);
      }
    },
  },
  beforeDestroy() {
    const dt = this.toDateTime(Date());
    if (this.client && this.workStation().length > 0) {
      const sub = `[${this.funcName} (${dt})] mqtt disconnect success`;
      console.log(sub);
      this.client.end();
    }
  },
};
</script>
<style scoped>
.cell-button .el-input-group__append {
  background-color: #67c23a;
  color: white;
}

.cell-button .el-button {
  background-color: #67c23a;
  color: white;
}
</style>
