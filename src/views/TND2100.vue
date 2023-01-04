<template>
  <div class="app-container">
    <el-form :model="params" label-width="100px" :inline="true">
      <el-form-item label="入庫單狀態">
        <el-input v-model="inbound.docStatusName" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND2001')">回列表</el-button>
      <el-button
        type="success"
        @click="onClose()"
        :disabled="isFinished == true || isReadOnly() == true"
      >
        結束此單作業
      </el-button>
    </el-form>

    <div v-for="img in imgs">
      <el-image
        class="floated_box"
        style="width: 200px; height: 150px"
        :src="img"
        fit="fit"
      ></el-image>
    </div>

    <!-- 主檔-->
    <el-table
      :data="inbounds"
      v-loading="loading"
      class="table-container"
      border
      stripe
    >
      <el-table-column
        label="項次"
        width="100"
        prop="seq"
        fixed
      ></el-table-column>

      <el-table-column
        label="入庫單號碼"
        prop="refNo"
        min-width="180"
      ></el-table-column>

      <el-table-column
        label="料品號"
        prop="prodCode"
        min-width="180"
      ></el-table-column>

      <el-table-column
        label="事務號"
        prop="transNo"
        min-width="125"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="供應商"
        prop="supplierProdCode"
        min-width="125"
      ></el-table-column>
      <el-table-column
        label="收料數量"
        prop="totalPlanQty"
        min-width="125"
      ></el-table-column>
      <el-table-column
        label="實際已入庫總數"
        prop="totalProdQty"
        min-width="180"
      ></el-table-column>
    </el-table>

    <!-- 條碼 -->
    <el-form class="mt-1" label-width="180px" :inline="true">
      <el-form-item label="請刷讀物流箱編號條碼">
        <el-input
          v-model="carrierId"
          @keyup.enter.native="setBarcode(carrierId)"
          :disabled="isFinished == true || isReadOnly() == true"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="onCallback()"
          :disabled="this.carrierId.length <= 0 || isReadOnly() == true"
        >
          料盒連動測試
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 明細 v-if="isDevelopment == true" -->
    <el-table :data="details" class="table-container" border>
      <el-table-column
        label="項次"
        width="100"
        prop="seq"
        fixed
      ></el-table-column>
      <el-table-column
        label="物流箱編號"
        prop="carrierId"
        min-width="180"
        fixed
      >
        <template slot-scope="scope">
          <span>{{ scope.row.carrierId }}</span>
          <el-button
            class="mt-1 ml-1"
            slot="append"
            size="mini"
            type="danger"
            @click="onDelete(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            刪除
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="磅秤重量"
        prop="weight"
        min-width="180"
      ></el-table-column>
      <el-table-column
        label="磅秤預估數量"
        prop="weightPlanQty"
        min-width="180"
      ></el-table-column>

      <el-table-column label="實際已入數量" prop="prodQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.prodQty"
            :disabled="scope.row.prodQtyEdit == false"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onProdQtyEdit(scope.row)">
              {{ scope.row.prodQtyEditName }}
            </el-button>
          </el-input>
          <span v-else>{{ scope.row.prodQty }}</span>
        </template>
      </el-table-column>

      <el-table-column label="輸入已入數量" prop="inQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.inQty"
            min="0.0"
            @keyup.enter.native="onAddProdQty(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onAddProdQty(scope.row)">
              加總數量
            </el-button>
          </el-input>
        </template>
      </el-table-column>

      <el-table-column label="帳差" prop="differenceQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.differenceQty"
            min="0.0"
            v-if="scope.row.isFinished == false"
          ></el-input>
          <span v-else>{{ scope.row.differenceQty }}</span>
        </template>
      </el-table-column>

      <el-table-column label="動作" width="180">
        <template slot-scope="scope">
          <div v-if="scope.row.isFinished == false">
            <el-button
              @click="onFinish(scope.row)"
              size="mini"
              type="success"
              :disabled="scope.row.prodQty <= 0"
            >
              放置完成，送回
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
// 執行入庫工作
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import mqtt_message from "@/utils/mixin/mqtt_message";

import config from "@/config.json";

import {
  getInbound,
  getInboundDetail,
  closeInbound,
  setInboundDetail,
  getInboundImage,
  deleteInboundDetail,
} from "@/api/inbound";

import { SelectTypeEnum } from "@/utils/enums/index";


export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin, mqtt_message],
  data() {
    return {
      funcName: "執行入庫工作",
      carrierId: "",
      inbound: {},
      inbounds: [],
      details: [],
      inStatus: [],
      loading: false,
      params: {
        sysOrderNo: "",
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
      fits: ["fill", "fill", "fill", "fill", "fill"],
      imgs: [],
    };
  },
  async created() {
    // 入庫單狀態
    this.inStatus = await this.getSelector(SelectTypeEnum.INBOUND_STATUS);
    this.onLoad();
    this.getInboundImage(this.$route.params.id);

    // 站點綁定
    if (this.workStation().length > 0) {
      // mqtt connect
      this.connect(this.funcName);
      this.client.on("message", this.handleMqtt);
    }
  },
  computed: {
    isFinished() {
      // 判斷主檔
      return this.inbound.docStatus >= 3 ? true : false;
    },
    canClose() {
      const dts = this.details.filter((x) => x.isFinished == false);
      return dts.length > 0 ? false : true;
    },
  },
  methods: {
    onLoad() {
      const inboundId = this.$route.params.id;
      //  主檔資料
      getInbound(inboundId).then((resp) => {
        if (resp.title == "successful") {
          for (let item of resp.message) {
            item.seq = 1;
          }
          this.inbounds = resp.message;
          this.inbound = this.inbounds[0];
        } else {
          this.inbound = {};
          this.inbounds = [];
        }
      });
      // 明細資料
      this.getInboundDetail(inboundId);
    },
    setBarcode(carrierId) {
      if (carrierId.length != 5) {
        this.warning("請輸入正確物流箱編號！");
        return;
      }
      // 確認是否未完成
      const isFinished = this.details.filter((x) => x.isFinished == false);
      if (isFinished.length > 0) {
        this.warning("尚有未完成放置，回送明細！");
        return;
      }
      const detail = this.newDetail(carrierId);
      this.setInboundDetail(detail);
    },
    // 結束此單
    async onClose() {
      const dts = this.details.filter((x) => x.isFinished == false);
      if (dts.length > 0) {
        this.warning("入庫工作，尚未完成，請完成放置，回送！");
        return;
      }

      if (this.inbound.totalProdQty <= 0) {
        let isConfirm = await this.confirm("實際入庫數量小於0，是否結束此單！");
        if (isConfirm == false) {
          return;
        }
      }
      // 判斷數量
      if (this.inbound.totalProdQty < this.inbound.totalPlanQty) {
        let isConfirm = await this.confirm(
          "實際入庫數量小於收料數量，是否結束此單！"
        );
        if (isConfirm == false) {
          return;
        }
      }

      closeInbound(this.inbound.sysOrderNo).then((resp) => {
        if (resp.status == "OK") {
          this.onNav("/TND2001");
        } else {
          this.warning(resp.message);
        }
      });
    },
    onDelete(val) {
      deleteInboundDetail(val.sysOrderNo, val.carrierId).then((resp) => {
        if (resp.status == "OK") {
          this.onLoad();
        }
      });
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
        this.setInboundDetail(val);
      }
    },
    onAddProdQty(val) {
      val.prodQtyEdit = false;
      val.prodQtyEditName = "編輯";

      if (val.inQty == "") {
        this.warning("請輸入數量");
        return;
      }
      val.prodQty = parseFloat(val.inQty) + parseFloat(val.prodQty);
      val.inQty = "";
    },
    onFinish(val) {
      val.isFinished = true;
      if (val.prodQty <= 0) {
        this.warning("實際已入數量等於0，不可入庫！");
        return;
      }
      this.setInboundDetail(val);
    },
    onCallback() {
      this.carrierCallback(this.carrierId);
    },
    newDetail(carrierId) {
      return {
        sysOrderNo: this.inbound.sysOrderNo,
        prodCode: this.inbound.prodCode,
        prodInboundDate: this.addDay(0),
        weightPlanQty: 0.0,
        prodQty: 0.0,
        differenceQty: 0.0,
        weight: 0.0,
        carrierId: carrierId,
        isFinished: false,
      };
    },
    getInboundDetail(inboundId) {
      this.details = [];
      getInboundDetail(inboundId).then((resp) => {
        if (resp.status == "OK") {
          this.details = resp.message;
          this.details.sort(function (a, b) {
            if (a.isFinished == true) {
              return 0;
            }
            return -1;
          });
          let seq = 1;
          for (let detail of this.details) {
            detail.seq = seq++;
            detail.inQty = "";
          }
        }
      });
    },
    getInboundImage(id) {
      this.imgs = [];
      getInboundImage(id).then((resp) => {
        if (resp.title == "successful") {
          if (resp.message.imgList.length <= 0) {
            this.imgs.push(config.coming_soon);
            return;
          }
          for (let item of resp.message.imgList) {
            const img = `data:image/png;base64, ${item}`;
            this.imgs.push(img);
            return;
          }
        } else {
          this.imgs.push(config.coming_soon);
        }
      });
    },
    setInboundDetail(data) {
      data.prodQty = parseFloat(data.prodQty);
      setInboundDetail(data).then((resp) => {
        if (resp.status == "OK") {
          this.carrierId = "";
          this.onLoad();
        } else {
          if (resp.message) {
            this.warning(resp.message);
          }
          this.warning(resp.errorMessage);
        }
      });
    },
    handleMqtt(topic, message) {
      const val = JSON.parse(message);
      const dt = Date();//this.toDateTime(Date());
      const sub = `[${this.funcName} (${dt})] subscribe to topics ${topic}`;
      console.log(sub);
      console.log(message.toString());
      this.carrierId = val.carrier;
      this.setBarcode(this.carrierId);
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
.floated_box {
  float: left;
  margin: 10px;
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
