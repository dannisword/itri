<template>
  <div class="app-container">
    <el-form :model="params" label-width="100px" :inline="true">
      <el-form-item label="出庫單狀態">
        <el-input v-model="outbound.docStatusName" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND3001')">回列表</el-button>
      <el-button type="success" @click="onNav('/TND3001')"
        >結束此單作業</el-button
      >
    </el-form>
    <el-button type="primary">物流箱進度查詢</el-button>
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
    <!-- -->
    <el-form class="mt-1" label-width="180px" :inline="true">
      <el-form-item label="請刷讀物流箱編號條碼">
        <el-input
          v-model="carrierId"
          @keyup.enter.native="setBarcode(carrierId)"
        ></el-input>
      </el-form-item>
    </el-form>

    <el-table :data="details" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="物流箱編號" prop="carrierId"> </el-table-column>
      <el-table-column label="物流箱內數量" prop="stockQty" width="125">
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
          <el-row>
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
} from "@/api/outbound";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
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
    },
    onFinish(val){
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
      const detail = this.newDetail(carrierId);
      this.setOutBoundDetail(detail);
    },
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
        prodInboundDate: this.addDay(0),
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
      getOutBoundDetail(outboundId).then((resp) => {
        if (resp.status == "OK") {
          let seq = 1;
          for (let detail of resp.message) {
            detail.seq = seq++;
            detail.prodQtyEdit = false;
            detail.prodQtyEditName = "編輯";
            detail.outQty = "";
            const data = this.clone(detail);
            this.details.push(data);
          }
          this.details.sort(function (a, b) {
            if (a.isFinished == true) {
              return 0;
            }
            return -1;
          });
          console.log(this.details);
        }
      });
    },
  },
};
</script>
