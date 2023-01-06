<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <el-form :inline="true">
      <el-form-item label="盤點單狀態">
        <el-input v-model="inventory.docStatusLabel" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND5001')">回列表</el-button>
    </el-form>

    <el-row type="flex" class="row-bg" justify="end">
      <el-col>
        <el-button type="primary" @click="onOpenLog">
          物流箱進度查詢({{ info.total }})
        </el-button>
      </el-col>
      <el-col> </el-col>
      <el-col>
        <el-button
          type="success"
          @click="onClose('CHECK')"
          :disabled="canFinish == false || isReadOnly() == true"
        >
          結束此單作業
        </el-button>
      </el-col>
    </el-row>

    <!-- 盤點單 -->
    <el-table
      :data="content"
      v-loading="loading"
      class="table-container"
      close-on-click-modal="false"
      border
      stripe
    >
      <el-table-column label="項次" prop="seq" width="80" fixed>
      </el-table-column>
      <el-table-column
        label="盤點單號碼"
        prop="sysOrderNo"
        min-width="200"
        fixed
      >
      </el-table-column>
      <el-table-column label="料品號" prop="prodCode" min-width="180">
      </el-table-column>
      <el-table-column label="盤點類型" prop="type" min-width="180">
      </el-table-column>
      <el-table-column label="盤點時間" prop="inventoryDate" min-width="180">
      </el-table-column>
      <el-table-column
        label="待盤點物流箱數量"
        prop="detailUnfinishCount"
        min-width="180"
      >
      </el-table-column>
      <el-table-column label="已盤點總數量" prop="totalProdQty" min-width="180">
      </el-table-column>
    </el-table>

    <el-form :inline="true" style="margin-top: 10px">
      <el-form-item label="備註">
        <el-input
          v-model="inventory.memo"
          disabled
          style="width: 500px"
        ></el-input>
      </el-form-item>
    </el-form>
    <el-row>
      <el-form :inline="false" style="margin-top: 10px">
        <el-form-item class="form-item-prev" label="請刷讀盤點前物流箱編號條碼">
          <el-input
            v-model="carrier.inBarcode"
            placeholder="請刷讀盤點前物流箱編號條碼"
            @keyup.enter.native="setBarcode('IN')"
            :disabled="isFinished == true || isReadOnly() == true"
          ></el-input>
        </el-form-item>
      </el-form>

      <el-form class="mt-1" :inline="true">
        <el-form-item class="form-item" label="請刷讀盤點後物流箱編號條碼">
          <el-input
            v-model="carrier.outBarcode"
            placeholder="請刷讀盤點後物流箱編號條碼"
            @keyup.enter.native="setBarcode('OUT')"
            :disabled="isFinished == true || isReadOnly() == true"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onCallback(carrier)"
            :disabled="carrier.outBarcode <= 0"
          >
            料盒連動測試
          </el-button>
        </el-form-item></el-form
      >
    </el-row>

    <!-- 盤點單明細 -->
    <el-table
      :data="details"
      v-loading="loading"
      class="table-container"
      close-on-click-modal="false"
      border
      stripe
    >
      <el-table-column label="項次" prop="seq" width="80" fixed>
      </el-table-column>
      <el-table-column
        label="盤點前物流箱編號"
        prop="carrierId"
        width="180"
        fixed
      >
      </el-table-column>
      <el-table-column
        label="盤點後物流箱編號"
        prop="afterCarrierId"
        width="180"
      >
      </el-table-column>
      <el-table-column label="料品號" prop="prodCode" min-width="180">
      </el-table-column>
      <el-table-column label="磅秤重量" prop="weight" min-width="180">
      </el-table-column>

      <!-- 已盤點數量 -->
      <el-table-column label="已盤點數量" prop="prodQty" width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            v-model="scope.row.prodQty"
            :disabled="scope.row.prodQtyEdit == false"
            v-if="isReadOnly() == true"
          >
            <el-button slot="append" @click="onProdQtyEdit(scope.row)">
              {{ scope.row.prodQtyEditName }}
            </el-button>
          </el-input>
          <span v-else>{{ scope.row.prodQty }}</span>
        </template>
      </el-table-column>

      <!-- 輸入盤點數量  -->
      <el-table-column label="輸入盤點數量" prop="inQty" min-width="220">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            v-model="scope.row.inQty"
            @keyup.enter.native="onAddDetail(scope.row)"
            v-if="isReadOnly() == true"
          >
            <el-button slot="append" @click="onAddDetail(scope.row)">
              加總數量
            </el-button>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column label="動作" align="center" min-width="120">
        <template slot-scope="scope">
          <el-button
            @click="onFinish(scope.row)"
            type="success"
            v-if="isReadOnly() == true"
            :disabled="scope.row.prodQty <= 0"
          >
            盤點完成
          </el-button>
          <span v-else>已完成盤點</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 結束此單-->
    <ModalDialog
      :title="dialogs.inv.title"
      :name="dialogs.inv.name"
      :visible.sync="dialogs.inv.visible"
      :optional="Small"
      @afterClosed="onModalClose"
    >
      <h2>有盤差，請選擇後續作業方式</h2>
      <div class="form-center">
        <el-form :inline="false">
          <el-form-item class="form-button">
            <el-button type="primary" @click="onAction('REINVENTORY')"
              >儲存，並產生複盤單
            </el-button>
          </el-form-item>
          <el-form-item class="form-button">
            <el-button type="primary" @click="onAction('ADJUSTMENT')"
              >儲存，並產生庫存異動單
            </el-button>
          </el-form-item>
          <el-form-item class="form-button">
            <el-button type="info" @click="onAction('SAVE')"
              >僅儲存盤點結果
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </ModalDialog>

    <ModalDialog
      :title="dialogs.log.title"
      :name="dialogs.log.name"
      :visible.sync="dialogs.log.visible"
      @afterClosed="onModalClose"
      :optional="Large"
    >
      <el-row :gutter="20">
        <el-col :span="6"> 站點：{{ inventory.assignWorkStationId }} </el-col>
      </el-row>
      <el-row class="mt-1" :gutter="20">
        <el-col :span="20"> 出庫單號碼{{ inventory.sysOrderNo }} </el-col>
      </el-row>
      <el-table
        :data="records"
        class="table-container"
        border
        stripe
        height="400px"
      >
        <el-table-column label="項次" prop="seq"> </el-table-column>
        <el-table-column label="物流箱編號" prop="carrierId"> </el-table-column>
        <el-table-column label="命令型態名稱" prop="opTypeName">
        </el-table-column>
        <el-table-column label="收到指令時間" prop="createTime">
        </el-table-column>
        <el-table-column label="完成指令時間" prop="finishTime">
        </el-table-column>
      </el-table>
    </ModalDialog>
  </div>
</template>
<script>
// name:"執行盤點工作",
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import mqtt_message from "@/utils/mixin/mqtt_message";

import {
  getInventory,
  getInvDetail,
  setInvDetail,
  setInvFinished,
  setInventoryDetail,
} from "@/api/inventory";
import {
  getReceiveInfo,
  carrierArrived,
  getCarrierArrived,
} from "@/api/system";

import { InvDocStatusEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin, mqtt_message],
  data() {
    return {
      funcName: "執行盤點工作",
      loading: false,
      info: {
        lastCount: 0,
        part: 0,
        total: 0,
      },
      inventory: {},
      content: [],
      details: [],
      records: [],
      carrier: {
        inBarcode: "",
        outBarcode: "",
      },
      params: {
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
      dialogs: {
        inv: {
          title: "提示訊息",
          name: "INV",
          visible: false,
        },
        log: {
          title: "物流箱進度查詢",
          name: "LOG",
          visible: false,
        },
      },
    };
  },
  async created() {
    // 站點綁定
    if (this.workStation().length > 0) {
      // mqtt connect
      this.connect(this.funcName);
      this.client.on("message", this.handleMqtt);
    }

    // 1: 初盤、2: 已完成有盤差、3: 複盤
    await this.onLoad();
  },
  computed: {
    isFinished() {
      // 判斷主檔
      return this.inventory.docStatus >= InvDocStatusEnum.Completed
        ? true
        : false;
    },
    canFinish() {
      // 切換盤點作業
      if (this.currentModelId() != 4) {
        //return false;
      }
      if (this.inventory.docStatus > 3) {
        return false;
      }
      var data = this.details.filter((x) => x.isFinished == false);
      return data.length > 0 ? false : true;
    },
    canClose() {
      var data = this.details.filter((x) => x.isFinished == false);
      return data.length > 0 ? false : true;
    },
  },
  methods: {
    onLoad() {
      this.content = [];
      this.details = [];
      getInventory(this.$route.params.id).then((resp) => {
        if (resp.status == "OK") {
          resp.message.seq = 1;
          this.inventory = resp.message;
          this.content.push(resp.message);
          this.handleFlow();
        }
      });

      getInvDetail(this.$route.params.id).then((resp) => {
        if (resp.status == "OK") {
          let seq = 1;
          for (let detail of resp.message) {
            detail.seq = seq++;
            detail.prodQtyEdit = false;
            detail.prodQtyEditName = "編輯";
            detail.inQty = "";
            const data = this.clone(detail);
            this.details.push(data);
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
    setBarcode(mode) {
      // 盤點前
      if (mode == "IN") {
        this.details[0].carrierId = this.carrier.inBarcode;
      }
      // 盤點後
      if (mode == "OUT") {
        if (this.carrier.outBarcode.length <= 0) {
          this.warning("請刷讀盤點後物流箱編號條碼");
          return;
        }
        setInventoryDetail(this.details[0].id, this.carrier.outBarcode).then(
          (resp) => {
            if (resp.title == "successful") {
              //this.carrier.outBarcode = "";
              this.onLoad();
            }
          }
        );
      }
    },
    async onOpenLog() {
      this.dialogs.log.visible = true;
      this.Large.showAction = false;
      const params = {
        docNo: this.inventory.sysOrderNo,
        workStn: this.workStation(),
      };
      const query = this.getQuery(params);
      getCarrierArrived(query).then((resp) => {
        if (resp.title == "successful") {
          this.records = resp.message.content;
          let seq = 1;
          for (let item of this.records) {
            item.seq = seq++;
          }
        }
      });
      await this.handleFlow();
    },
    // 結束此單
    onClose(action) {
      // 待盤點
      if (this.inventory.detailUnfinishCount > 0) {
        this.confirm("尚有待盤點的物流箱，無法結束此單作業", false);
        return;
      }
      // 待盤點的物流箱數量與 已盤點的物流箱數量不符，尚無法結束此單作業
      const docNo = this.inventory.sysOrderNo;
      setInvFinished(docNo, action).then((resp) => {
        if (resp.title == "successful") {
          // 盤差
          if (resp.message.isDiffQty == true) {
            this.Small.showAction = false;
            this.dialogs.inv.visible = true;
          }
        }
      });
    },
    onAction(action) {
      // ADJUSTMENT 儲存並產生庫存異動單
      // REINVENTORY 儲存並產生復盤單
      // SAVE 僅儲存盤點結果
      this.dialogs.inv.visible = false;
      const docNo = this.inventory.sysOrderNo;
      setInvFinished(docNo, action).then((resp) => {
        if (resp.title == "successful") {
          this.onNav("/TND5001");
        }
      });
    },
    // 盤點完成
    onFinish(val) {
      this.setDetail(val, true);
    },
    onProdQtyEdit(val) {
      val.prodQtyEdit = !val.prodQtyEdit;
      val.prodQtyEditName = "編輯";
      if (val.prodQtyEdit == true) {
        val.prodQtyEditName = "存檔";
      } else {
        this.setDetail(val, false);
      }
    },
    onAddDetail(val) {
      if (val.afterCarrierId == null) {
        this.warning(`請刷讀盤點後物流箱編號條碼`);
        return;
      }
      if (parseFloat(val.inQty) == NaN) {
        return;
      }
      val.prodQty = parseFloat(val.inQty) + parseFloat(val.prodQty);
      val.inQty = "";

      this.setDetail(val, false);
    },
    onModalClose(val) {
      this.dialogs.inv.visible = false;
      this.dialogs.log.visible = false;
    },
    onCallback(val) {
      this.carrierCallback(val.outBarcode);
    },
    setDetail(val, isFinish) {
      //this.loading = true;
      const data = {
        afterCarrierId: val.afterCarrierId,
        prodQty: val.prodQty,
      };

      setInvDetail(val.id, isFinish, data)
        .then((resp) => {
          this.loading = false;
          this.onLoad();
        })
        .catch((e) => {
          this.warning("執行盤點工作-異常！");
          this.loading = false;
        });
    },
    async handleFlow() {
      // A1-44
      let resp;
      this.info.lastCount = 0;
      this.info.part = 0;
      this.info.total = 0;
      /*
      resp = await getReceiveInfo("出庫");
      if (resp.title == "successful") {
        this.info.lastCount = resp.message.lastCount;
      }*/
      resp = await carrierArrived(this.inventory.sysOrderNo, "盤點");
      if (resp.title == "successful") {
        this.info.part = resp.message.part;
        this.info.total = resp.message.total;
      }
      // A4-23
      //this.onLoad();
      // A4-3
    },
    setInvFinished(docNo, action) {
      return new Promise((resolve) => {
        setInvFinished(docNo, action).then((resp) => {
          if (resp.title == "successful") {
            resolve(resp.message.isDiffQty);
          }
          resolve(false);
        });
      });
    },
    handleMqtt(topic, message) {
      const val = JSON.parse(message);
      const dt = Date(); //this.toDateTime(Date());
      const sub = `[${this.funcName} (${dt})] subscribe to topics ${topic}`;
      console.log(sub);
      console.log(message.toString());
      // 判斷BCR
      const mode = this.carrierMap(val.sensor);
      console.log(mode);
      // IN 盤點後  OUT 盤點前
      if (mode == "IN") {
        this.carrier.outBarcode = val.carrier;
      } else {
        this.carrier.inBarcode = val.carrier;
      }
      this.setBarcode(mode);
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
.form-item-prev .el-form-item__label {
  font-size: 30px;
  color: #1e88e5;
}
.form-item-prev .el-input {
  width: 300px;
}

.form-item .el-form-item__label {
  font-size: 30px;
}
.form-item .el-input {
  width: 300px;
}
.cell-button .el-input-group__append {
  background-color: #67c23a;
  color: white;
}
.form-button .el-button {
  width: 280px;
}

.form-center {
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-button .el-input-group__append {
  background-color: #67c23a;
  color: white;
}

.cell-button .el-button {
  background-color: #67c23a;
  color: white;
}
</style>
