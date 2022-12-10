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
        <el-button type="primary" @click="handleFlow">
          物流箱進度查詢({{ info.part }}/{{ info.total }})
        </el-button>
      </el-col>
      <el-col> </el-col>
      <el-col>
        尚有{{ info.lastCount }}筆工作
        <el-button
          type="success"
          @click="onClose()"
          :disabled="isFinished == true"
        >
          結束此單作業
        </el-button>
      </el-col>
    </el-row>

    <!-- 主檔 -->
    <el-table :data="outbounds" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="出庫單號碼" prop="sysOrderNo" min-width="180">
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

    <el-table :data="details" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="物流箱編號" prop="carrierId"> </el-table-column>
      <el-table-column label="物流箱內數量" prop="planQty" width="125">
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
            <el-button @click="onFinish(scope.row)" size="mini" type="primary"
              >放置完成，送回
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { SelectTypeEnum } from "@/utils/enums/index";
import {
  getOutbound,
  getOutBoundDetail,
  setOutBoundDetail,
  takeOutBoundDetail,
  closeOutbound,
} from "@/api/outbound";

import { getReceiveInfo, carrierArrived } from "@/api/system";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
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
      params: {
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
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
    await this.onLoad();
  },
  methods: {
    onLoad() {
      const outboundId = this.$route.params.id;
      this.outbound = {};
      this.outbounds = [];
      getOutbound(outboundId).then((resp) => {
        if (resp.status == "OK") {
          this.outbound = resp.message;
          this.outbound.seq = 1;
          var status = this.outStatus.filter(
            (x) => x.value == this.outbound.docStatus
          );

          if (status.length > 0) {
            this.outbound.docStatusName = status[0].label;
          } else {
            this.outbound.docStatusName = "狀態錯誤";
          }
          this.outbounds.push(this.outbound);
        }
      });
      this.getOutBoundDetail(outboundId);
    },
    onRemove(val) {
      console.log(val);
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
      console.log(this.outbound.sysOrderNo);
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
      val.prodQty = parseInt(val.outQty) + parseInt(val.prodQty);
      val.inQty = "";
    },
    setBarcode(carrierId) {
      this.handleFlow();
      //const detail = this.newDetail(carrierId);
      //this.setOutBoundDetail(detail);
    },
    onCallback() {
      this.carrierCallback(this.carrierId);
    },
    //A4-11 回報單據明細出庫資料(編輯/放置完成，回送)
    setOutBoundDetail(detail) {
      setOutBoundDetail(detail).then((resp) => {
        if (resp.status == "OK") {
          this.onLoad();
        } else {
          if (resp.message) {
            this.warning(resp.message);
          }
          this.warning(resp.errorMessage);
        }
      });
    },
    newDetail(carrierId) {
      return {
        sysOrderNo: this.outbound.sysOrderNo,
        prodCode: this.outbound.prodCode,
        //prodInboundDate: this.addDay(0),
        inboundDate: this.addDay(0),
        weightPlanQty: 0,
        prodQty: 0,
        differenceQty: 0,
        weight: 0,
        carrierId: carrierId,
        isFinished: false,
        stockQty: 0,
      };
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
        this.info.lastCount = resp.message.lastCount;
      }
      // A1-46 I,O,PR,IN
      resp = await carrierArrived(this.outbound.sysOrderNo, "出庫");
      if (resp.title == "successful") {
        this.info.part = resp.message.part;
        this.info.total = resp.message.total;
      }
      // A4-23
      this.onLoad();
      // A4-3
    },
  },
};
</script>
