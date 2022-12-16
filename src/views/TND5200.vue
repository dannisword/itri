<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <el-form :inline="true">
      <el-form-item label="盤點單狀態">
        <el-input v-model="adjustment.docStatusLabel" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND5002')">回列表</el-button>
      <el-button
        type="success"
        @click="onClose()"
        :disabled="canFinish == false"
        >結束此單作業</el-button
      >
    </el-form>

    <!-- 異動單 -->
    <el-table
      :data="adjustments"
      v-loading="loading"
      class="table-container"
      close-on-click-modal="false"
      border
      stripe
    >
      <el-table-column label="項次" prop="seq" width="80" fixed>
      </el-table-column>
      <el-table-column
        label="異動單號碼"
        prop="sysOrderNo"
        min-width="200"
        fixed
      >
      </el-table-column>
      <el-table-column
        label="盤點單號碼"
        prop="sourceSysOrderNo"
        min-width="180"
      >
      </el-table-column>

      <el-table-column label="料品號" prop="prodCode" min-width="180">
      </el-table-column>

      <el-table-column label="異動時間" prop="createTime" min-width="180">
      </el-table-column>
    </el-table>

    <el-form :inline="true" style="margin-top: 10px">
      <el-form-item label="備註">
        <el-input
          v-model="adjustment.memo"
          disabled
          style="width: 500px"
        ></el-input>
      </el-form-item>
    </el-form>

    <!-- 異動單明細 -->
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
        min-width="200"
        fixed
      >
      </el-table-column>
      <el-table-column
        label="盤點後物流箱編號"
        prop="afterCarrierId"
        min-width="180"
      >
      </el-table-column>

      <el-table-column label="庫存數量" prop="stockQty" min-width="180">
      </el-table-column>

      <el-table-column label="盤點數量" prop="inventoryQty" min-width="180">
      </el-table-column>

      <el-table-column label="差異數" prop="differenceQty" min-width="180">
      </el-table-column>

      <el-table-column label="動作" align="center" min-width="120">
        <template slot-scope="scope">
          <el-button
            @click="onFinish(scope.row)"
            type="success"
            v-if="scope.row.isFinished == false"
            :disabled="scope.row.prodQty <= 0"
            >異動完成
          </el-button>
          <span v-else>已完成異動</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
// 執行庫存異動
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import {
  getAdjustment,
  getAdjustmentDetail,
  setAdjustmentDetail,
  setAdjustmentFinish,
} from "@/api/inventory";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      adjustment: {},
      adjustments: [],
      details: [],
    };
  },
  created() {
    this.onLoad();
  },
  computed: {
    canFinish() {
      // 切換盤點作業
      if (this.currentModelId() != 4) {
        //return false;
      }
      return this.adjustment.isFinished;
    },
  },
  methods: {
    onLoad() {
      this.adjustments = [];
      getAdjustment(this.$route.params.id).then((resp) => {
        if (resp.title == "successful") {
          resp.message.seq = 1;
          this.adjustment = resp.message;
          this.adjustments.push(this.adjustment);
        }
      });
      getAdjustmentDetail(this.$route.params.id).then((resp) => {
        if (resp.title == "successful") {
          this.details = resp.message;
          let seq = 1;
          for (let detail of this.details) {
            detail.seq = seq++;
          }
        }
      });
    },
    onClose() {
      setAdjustmentFinish(this.adjustment.sysOrderNo).then((resp) => {
        console.log(resp);
        if ((resp.title = "successful")) {
          //this.onLoad();
          this.onNav("/TND5002");
        }
      });
    },
    async onFinish(val) {
      const isConfirm = await this.confirm(
        "是否確認要將「庫存數量」異動為「已異動數量」"
      );

      if (isConfirm == true) {
        setAdjustmentDetail(val.id).then((resp) => {
          console.log(resp);
          if ((resp.title = "successful")) {
            this.onLoad();
          }
        });
      }
    },
  },
};
</script>
