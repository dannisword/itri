<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <el-form :model="params" label-width="100px" :inline="true">
          <el-form-item label="單據狀態">
            <el-input v-model="process.docStatusName" disabled></el-input>
          </el-form-item>
          <el-button type="primary" @click="onNav('/TND4001')"
            >回列表</el-button
          >
        </el-form>
      </el-col>
      <el-col type="flex" justify="end" :span="12" style="text-align: right">
        尚有{{ lastCount }}筆工作
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
    <el-table :data="processing" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="加工單號碼" prop="sysOrderNo" min-width="180">
      </el-table-column>
      <el-table-column label="原物料品號" prop="prodCode" min-width="180">
      </el-table-column>
      <el-table-column label="供應商" prop="supplierProdCode" min-width="180">
      </el-table-column>
      <el-table-column
        label="加工後-料品號"
        prop="new_prodCode"
        min-width="180"
      >
      </el-table-column>
      <el-table-column label="預計加工數量" prop="totalPlanQty" min-width="180">
      </el-table-column>
      <el-table-column label="已加工數量" prop="totalProdQty" min-width="180">
      </el-table-column>
      <el-table-column label="總帳差" prop="totalDifferenceQty" min-width="180">
      </el-table-column>
    </el-table>

    <!-- 揀料條碼 -->
    <el-row>
      <el-col :span="18">
        <el-form class="mt-1" label-width="220px" :inline="true">
          <el-form-item label="請刷讀原料物流箱編號條碼">
            <el-input
              v-model="carrier.sourceId"
              @keyup.enter.native="setSourceBarcode(carrier.sourceId)"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"> 補料 </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6" type="flex" justify="end">
        <el-form class="mt-1" :inline="false">
          <el-form-item>
            <el-button
              type="primary"
              @click="onCallback(carrier, 'SOURCE')"
              :disabled="this.carrier.sourceId.length <= 0"
            >
              料盒連動測試
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!-- 待揀料明細 -->
    <el-table :data="source" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="物流箱編號" prop="carrierId" min-width="180">
      </el-table-column>
      <el-table-column label="磅秤重量" prop="weight" min-width="180">
      </el-table-column>
      <el-table-column label="物流箱內數量" prop="planQty" min-width="180">
      </el-table-column>

      <el-table-column label="實際取出數量" prop="prodQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.prodQty"
            :disabled="scope.row.prodQtyEdit == false"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onSourceEdit(scope.row)">{{
              scope.row.prodQtyEditName
            }}</el-button>
          </el-input>
          <span v-else>{{ scope.row.prodQty }}</span>
        </template>
      </el-table-column>

      <el-table-column label="輸入取出數量" prop="outQty" min-width="280">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.outQty"
            min="0"
            @keyup.enter.native="onAddSource(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onAddSource(scope.row)"
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
              @click="onSourceFinish(scope.row)"
              size="mini"
              type="primary"
              :disabled="scope.row.prodQty <= 0"
              >拿取完成，送回
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>

    <!-- 加工後物流箱條碼 -->
    <el-row>
      <el-col :span="18">
        <el-form class="mt-1" label-width="220px" :inline="true">
          <el-form-item label="請刷讀加工物流箱編號條碼">
            <el-input
              v-model="carrier.targetId"
              @keyup.enter.native="setTargetBarcode(carrier.targetId)"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="onCallback(carrier, 'TARGET')"
              :disabled="this.carrier.targetId.length <= 0"
            >
              料盒連動測試
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6" type="flex" justify="end"> </el-col>
    </el-row>

    <!-- 加工後明細 -->
    <el-table :data="target" class="table-container" border>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>

      <el-table-column label="物流箱編號" prop="carrierId" min-width="180">
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

      <el-table-column label="磅秤重量" prop="weight" min-width="180">
      </el-table-column>

      <el-table-column label="實際加工數量" prop="prodQty" min-width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.prodQty"
            :disabled="scope.row.prodQtyEdit == false"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onTargetEdit(scope.row)">{{
              scope.row.prodQtyEditName
            }}</el-button>
          </el-input>
          <span v-else>{{ scope.row.prodQty }}</span>
        </template>
      </el-table-column>

      <el-table-column label="輸入取出數量" prop="inQty" min-width="280">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            type="number"
            v-model="scope.row.inQty"
            min="0"
            @keyup.enter.native="onAddTarget(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onAddTarget(scope.row)"
              >加總數量</el-button
            >
          </el-input>
        </template>
      </el-table-column>

      <el-table-column label="動作" prop="statusName" width="280">
        <template slot-scope="scope">
          <el-row v-if="scope.row.isFinished == false">
            <el-button
              @click="onTargetFinish(scope.row)"
              size="mini"
              type="primary"
              :disabled="scope.row.prodQty <= 0"
            >
              放置完成，送回
            </el-button>
          </el-row>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
//
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import {
  getProcessing,
  getProcessTodo,
  closeProcess,
  getProcessDetails,
  setSourceDetail,
  setTargetDetail,
  takeProcessingDetail,
  delProcessingDetail,
  finishedSourceDetails,
  finishedTargetDetails,
} from "@/api/processing";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      lastCount: 0,
      process: {},
      processing: [],
      source: [],
      target: [],
      carrier: {
        sourceId: "",
        targetId: "",
      },
      params: {
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
    };
  },
  created() {
    this.onLoad();
  },
  computed: {
    isFinished() {
      // 判斷主檔
      return this.process.docStatus >= 3 ? true : false;
    },
    canClose() {
      // 判斷是否能結束

      return false;
    },
  },
  methods: {
    onLoad() {
      const processingId = this.$route.params.id;
      this.process = {};
      this.processing = [];
      this.getProcessTodo();

      getProcessing(processingId).then((resp) => {
        if (resp.title == "successful") {
          this.process = resp.message;
          this.process.seq = 1;
          this.processing.push(this.process);
        }
      });
      this.getProcessDetails(processingId);
    },
    async onClose() {
      //
      if (this.process.totalProdQty <= 0) {
        let isConfirm = await this.confirm("加工總數小於0，是否結束此單！");
        if (isConfirm == false) {
          return;
        }
      }
      //
      const resp = await closeProcess(this.process.sysOrderNo);
      if (resp.title == "successful") {
        this.onNav("/TND4001");
      } else {
        this.warning(resp.message);
      }
    },
    // 拿取完成
    onSourceFinish(val) {
      val.isFinished = true;
      this.setSourceDetail(val);
    },
    // 放置完成
    onTargetFinish(val) {
      val.isFinished = true;
      this.setTargetDetail(val);
    },
    // 原料編輯數量
    onSourceEdit(val) {
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
        this.setSourceDetail(val);
      }
    },
    // 加工編輯數量
    onTargetEdit(val) {
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
        this.setTargetDetail(val);
      }
    },
    // 原料加總數量
    onAddSource(val) {
      val.prodQtyEdit = false;
      val.prodQtyEditName = "編輯";

      if (val.outQty == "") {
        this.warning("請輸入數量");
        return;
      }
      val.prodQty = parseInt(val.outQty) + parseInt(val.prodQty);
      val.outQty = "";
   
      this.setSourceDetail(val);
    },
    // 加工加總數量
    onAddTarget(val) {
      val.prodQtyEdit = false;
      val.prodQtyEditName = "編輯";

      if (val.inQty == "") {
        this.warning("請輸入數量");
        return;
      }
      val.prodQty = parseInt(val.inQty) + parseInt(val.prodQty);
      val.inQty = "";
      this.setTargetDetail(val);
    },
    // 取下
    onRemove(val) {
      takeProcessingDetail(val).then((resp) => {
        console.log(resp);
      });
    },
    // 刪除
    onDelete(val) {
      delProcessingDetail(val).then((resp) => {
        if (resp.title == "successful") {
          this.onLoad();
        }
      });
    },
    // 請刷讀原料物流箱編號條碼
    setSourceBarcode(val) {
      finishedSourceDetails(this.process.sysOrderNo, val).then((resp) => {
        console.log(resp);
        if (resp.title == "successful") {
          this.onLoad();
        }
      });
    },
    // 請刷讀加工物流箱編號條碼
    setTargetBarcode(val) {
      finishedTargetDetails(this.process.sysOrderNo, val).then((resp) => {
        console.log(resp);
        if (resp.title == "successful") {
          this.onLoad();
        }
      });
    },
    onCallback(val, mode) {
      console.log(val);
      let carrier = "";
      if (mode == "SOURCE") {
        carrier = val.sourceId;
      } else {
        carrier = val.targetId;
      }
      this.carrierCallback(carrier);
    },
    getProcessDetails(processingId) {
      this.source = [];
      getProcessDetails(processingId).then((resp) => {
        if (resp.title != "successful") {
          return;
        }
        // source
        this.source = resp.message.docProcessingSourceDetail;
        let seq = 1;
        for (let item of this.source) {
          item.seq = seq++;
          item.outQty = "";
        }
        this.source.sort(function (a, b) {
          if (a.isFinished == true) {
            return 0;
          }
          return -1;
        });

        // target
        this.target = resp.message.docProcessingTargetDetail;
        seq = 1;
        for (let item of this.target) {
          item.seq = seq++;
          item.inQty = "";
        }
        this.target.sort(function (a, b) {
          if (a.isFinished == true) {
            return 0;
          }
          return -1;
        });
      });
    },
    getProcessTodo() {
      getProcessTodo(this.workStation()).then((resp) => {
        if (resp.title == "successful") {
          this.lastCount = resp.message;
        }
      });
    },
    setSourceDetail(source) {
      setSourceDetail(source).then((resp) => {
        if (resp.title == "successful") {
          this.onLoad();
        }
      });
    },
    setTargetDetail(target) {
      setTargetDetail(target).then((resp) => {
        if (resp.title == "successful") {
          this.onLoad();
        }
      });
    },
    newDetail(carrierId) {
      return {
        id: null,
        parentId: 1,
        sysOrderNo: this.process.sysOrderNo,
        isFinished: false,
        roomCode: null,
        locationCode: null,
        prodCode: this.process.prodCode,
        carrierId: carrierId,
        stockQty: 0,
        prodQty: 0,
        planQty: 0,
        differenceQty: 0,
        weight: null,
        status: null,
        isFinished: false,
      };
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

.cell-button .el-button {
  background-color: #67c23a;
  color: white;
}
</style>
