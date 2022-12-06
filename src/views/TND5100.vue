<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <el-form :inline="true">
      <el-form-item label="盤點單狀態">
        <el-input v-model="inventory.docStatusLabel" disabled></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onBack()">回列表</el-button>
        <el-button
          type="success"
          @click="onFinished('FINISHED')"
          :disabled="canFinish == false"
          >結束此單作業</el-button
        >
      </el-form-item>
    </el-form>
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
      <el-table-column label="料品號" prop="prodCode"> </el-table-column>
      <el-table-column label="盤點類型" prop="type"> </el-table-column>
      <el-table-column label="盤點時間" prop="inventoryDate"> </el-table-column>
      <el-table-column label="待盤點物流箱數量" prop="totalPlanQty" width="180">
      </el-table-column>
      <el-table-column label="已盤點總數量" prop="totalProdQty" width="180">
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
        <el-col :span="24">
          <el-form-item
            class="form-item-prev"
            label="請刷讀盤點前物流箱編號條碼"
          >
            <el-input
              v-model="carrier.inBarcode"
              placeholder="請刷讀盤點前物流箱編號條碼"
              @keyup.enter.native="setBarcode(0)"
              :disabled="isFinished == true"
            ></el-input>
          </el-form-item>
          <el-form-item class="form-item" label="請刷讀盤點後物流箱編號條碼">
            <el-input
              v-model="carrier.outBarcode"
              placeholder="請刷讀盤點後物流箱編號條碼"
              @keyup.enter.native="setBarcode(1)"
              :disabled="isFinished == true"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-form>
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
      <el-table-column label="料品號" prop="prodCode" min-width="120">
      </el-table-column>
      <el-table-column label="磅秤重量" prop="weight" min-width="120">
      </el-table-column>
      <el-table-column label="isFinished" prop="isFinished" min-width="120">
      </el-table-column>

      <!-- 已盤點數量 -->
      <el-table-column label="已盤點數量" prop="prodQty" width="180">
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

      <!-- 輸入盤點數量  -->
      <el-table-column label="輸入盤點數量" prop="inQty" width="180">
        <template slot-scope="scope">
          <el-input
            class="cell-button"
            v-model="scope.row.inQty"
            @keyup.enter.native="onAddDetail(scope.row)"
            v-if="scope.row.isFinished == false"
          >
            <el-button slot="append" @click="onAddDetail(scope.row)"
              >加總數量</el-button
            >
          </el-input>
        </template>
      </el-table-column>
      <el-table-column label="動作" align="center" min-width="120">
        <template slot-scope="scope">
          <el-button
            @click="onSaveDetail(scope.row)"
            type="success"
            v-if="scope.row.isFinished == false"
            >盤點完成
          </el-button>
          <span v-else>已完成盤點</span>
        </template>
      </el-table-column>
    </el-table>

    <ModalDialog
      :title="dialogs.inv.title"
      :name="dialogs.inv.name"
      :visible.sync="dialogs.inv.visible"
      :optional="Small"
      @afterClosed="onModalClose"
    >
      <div class="form-center">
        <el-form :inline="false">
          <el-form-item class="form-button">
            <el-button type="primary" @click="onFinished('REINVENTORY')"
              >儲存，並產生複盤單
            </el-button>
          </el-form-item>
          <el-form-item class="form-button">
            <el-button type="primary" @click="onFinished('ADJUSTMENT')"
              >儲存，並產生庫存異動單
            </el-button>
          </el-form-item>
          <el-form-item class="form-button">
            <el-button type="info" @click="onFinished('SAVE')"
              >僅儲存盤點結果
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </ModalDialog>
  </div>
</template>
<script>
// name:"執行盤點工作",
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import {
  getInventory,
  getInvDetail,
  setInvDetail,
  setInvFinished,
} from "@/api/inventory";
import { InvDocStatusEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      inventory: {},
      content: [],
      details: [],
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
      },
    };
  },
  created() {
    // 1: 初盤、2: 已完成有盤差、3: 複盤
    this.onLoad();
  },
  computed: {
    isFinished() {
      // 判斷主檔
      return this.inventory.docStatus == InvDocStatusEnum.Effective ||
        this.inventory.docStatus == InvDocStatusEnum.Progress
        ? false
        : true;
    },
    canFinish() {
      // 切換盤點作業
      if (this.currentModel() != 4) {
        return false;
      }
      let finished =
        this.inventory.docStatus == InvDocStatusEnum.Effective ||
        this.inventory.docStatus == InvDocStatusEnum.Progress
          ? true
          : false;
      if (finished == true) {
        var data = this.details.filter((x) => x.isFinished == false);
        return data.length > 0 ? false : true;
      }
      return finished;
    },
  },
  methods: {
    onLoad() {
      this.content = [];
      this.details = [];
      getInventory(this.$route.params.id).then((resp) => {
        if (resp.status == "OK") {
          this.inventory = resp.message;
          resp.message.seq = 1;
          this.content.push(resp.message);
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
            detail.afterCarrierId = "00012";
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
    setBarcode(archive) {
      if (archive == 0) {
        this.details[0].carrierId = this.carrier.inBarcode;
      }
      if (archive == 1) {
        this.details[0].afterCarrierId = this.carrier.outBarcode;
      }
    },
    onBack() {
      this.onNav("/TND5001");
    },
    onFinished(action) {
      // 開窗 FINISHED
      if (action == "FINISHED") {
        this.Small.showAction = false;
        this.dialogs.inv.visible = true;
        return;
      }
      // ADJUSTMENT 儲存並產生庫存異動單
      // REINVENTORY 儲存並產生復盤單
      // SAVE 僅儲存盤點結果
      this.dialogs.inv.visible = false;
      this.setFinished(action);
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
    onSaveDetail(val) {
      this.setDetail(val, true);
    },
    onAddDetail(val) {
      if (val.afterCarrierId == null) {
        this.warning(`請刷讀盤點後物流箱編號條碼`);
        return;
      }
      if (parseInt(val.inQty) == NaN) {
        return;
      }
      val.prodQty = parseInt(val.inQty) + parseInt(val.prodQty);
      val.inQty = "";
      this.setDetail(val, false);
    },
    onModalClose(val) {
      this.dialogs.inv.visible = false;
    },
    setFinished(action) {
      setInvFinished(this.content[0].sysOrderNo, action).then((resp) => {
        console.log(resp);
        if (resp.status == "OK") {
          this.onBack();
        }
      });
    },
    setDetail(val, isFinish) {
      this.loading = true;
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
</style>
