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
        :disabled="isFinished == true"
        >結束此單作業</el-button
      >
    </el-form>
    
    <div v-for="img in imgs" >
      <el-image
        class="floated_box"
        style="width: 150px; height: 100px"
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
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="入庫單號碼" prop="sysOrderNo"> </el-table-column>
      <el-table-column label="料品號" prop="prodCode"> </el-table-column>
      <el-table-column label="供應商" prop="supplierProdCode" width="125">
      </el-table-column>
      <el-table-column label="收料數量" prop="totalPlanQty" width="125">
      </el-table-column>
      <el-table-column label="實際已入庫總數" prop="totalProdQty" width="180">
      </el-table-column>
    </el-table>
    <!-- 條碼 -->
    <el-form class="mt-1" label-width="180px" :inline="true">
      <el-form-item label="請刷讀物流箱編號條碼">
        <el-input
          v-model="barcode"
          @keyup.enter.native="setBarcode(barcode)"
          :disabled="isFinished == true"
        ></el-input>
      </el-form-item>
    </el-form>

    <!-- 明細 -->
    <el-table :data="details" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="物流箱編號"
        prop="carrierId"
        min-width="180"
        fixed
      >
        <template slot-scope="scope">
          <span>{{ scope.row.carrierId }}</span>
          <el-button
            slot="append"
            @click="onDelete(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            刪除
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="磅秤重量" prop="weight" min-width="180">
      </el-table-column>
      <el-table-column
        label="磅秤預估數量"
        prop="weightPlanQty"
        min-width="180"
      >
      </el-table-column>
      <el-table-column label="實際已入庫總數" prop="prodQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
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

      <el-table-column label="輸入已入數量" prop="inQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            v-model="scope.row.inQty"
            @keyup.enter.native="onAddProdQty(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onAddProdQty(scope.row)"
              >加總數量</el-button
            >
          </el-input>
        </template>
      </el-table-column>

      <el-table-column label="帳差" prop="differenceQty"> </el-table-column>
      <el-table-column label="動作" width="180">
        <template slot-scope="scope">
          <div v-if="scope.row.isFinished == false">
            <el-button
              @click="onSetDetail(scope.row)"
              size="mini"
              type="primary"
              >放置完成，送回
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
import config from "@/utils/mixin/config.json";

import {
  getInbound,
  getInboundDetail,
  closeInbound,
  setInboundDetail,
  getInboundImage,
} from "@/api/inbound";

import { SelectTypeEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      barcode: "",
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
  },
  computed: {
    isFinished() {
      // 判斷主檔
      return this.inbound.docStatus >= 3 ? true : false;
    },
  },
  methods: {
    onLoad() {
      const inboundId = this.$route.params.id;

      //  主檔資料
      getInbound(inboundId).then((resp) => {
        if (resp.status == "OK") {
          this.inbound = resp.message;
          this.inbound.seq = 1;
          var status = this.inStatus.filter(
            (x) => x.value == this.inbound.docStatus
          );
          if (status.label > 0) {
            this.inbound.docStatusName = status[0].label;
          } else {
            this.inbound.docStatusName = "狀態錯誤";
          }
          this.inbounds.push(resp.message);
          // 圖檔資料
          /*
          getInboundImage(this.inbound.sysOrderNo).then((resp) => {
            console.log(resp);
          });*/
        }
      });
      // 明細資料
      this.getInboundDetail(inboundId);
      // TODO
      this.imgs.push(config.coming_soon);
      this.imgs.push(config.coming_soon);
      this.imgs.push(config.coming_soon);
      this.imgs.push(config.coming_soon);
      this.imgs.push(config.coming_soon);
      console.log(this.imgs);
    },
    setBarcode(barcode) {
      const detail = this.newDetail(barcode);
      this.setInboundDetail(detail);
    },
    // 結束此單
    onClose() {
      closeInbound(this.inbound.sysOrderNo).then((resp) => {
        if (resp.status == "OK") {
          this.onNav("/TND2001");
        } else {
          this.warning(resp.message);
        }
      });
    },
    onDelete(val) {
      console.log(val);
    },
    onProdQtyEdit(val) {
      val.prodQtyEdit = !val.prodQtyEdit;
      val.prodQtyEditName = "編輯";
      if (val.prodQtyEdit == true) {
        val.prodQtyEditName = "存檔";
      } else {
        this.setInboundDetail(val);
      }
    },
    onAddProdQty(val) {
      val.prodQty = parseInt(val.inQty) + parseInt(val.prodQty);
      val.inQty = "";
    },
    onSetDetail(val) {
      val.isFinished = true;
      this.setInboundDetail(val);
    },
    newDetail(barcode) {
      return {
        sysOrderNo: this.inbound.sysOrderNo,
        prodCode: this.inbound.prodCode,
        prodInboundDate: this.addDay(0),
        weightPlanQty: 0,
        prodQty: 0,
        differenceQty: 0,
        weight: 0,
        carrierId: barcode,
        isFinished: false,
      };
    },
    getInboundDetail(inboundId) {
      this.details = [];
      getInboundDetail(inboundId).then((resp) => {
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
    setInboundDetail(data) {
      setInboundDetail(data).then((resp) => {
        if (resp.status == "OK") {
          this.getInboundDetail(this.inbound.id);
        } else {
          if (resp.message) {
            this.warning(resp.message);
          }
          this.warning(resp.errorMessage);
        }
      });
    },
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
</style>
