<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <el-form :inline="true">
      <el-form-item label="盤點單狀態">
        <el-input v-model="adjustment.docStatusLabel" disabled></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND5002')">回列表</el-button>
      <el-button type="success" @click="onClose()">結數此單作業</el-button>
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
      <el-table-column label="盤點單號碼" prop="sourceSysOrderNo" min-width="180">
      </el-table-column>

      <el-table-column label="料品號" prop="prodCode" min-width="180">
      </el-table-column>

      <el-table-column label="異動時間" prop="updateTime" min-width="180">
      </el-table-column>

    </el-table>
  </div>
</template>
<script>
// 執行庫存異動
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getAdjustment } from "@/api/inventory";

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
  methods: {
    onLoad() {
      getAdjustment(this.$route.params.id).then((resp) => {
        console.log(resp);
        if (resp.title == "successful") {
          resp.message.seq = 1;
          this.adjustment = resp.message;
          this.adjustments.push(this.adjustment);
        }
      });
    },
    onClose() {},
  },
};
</script>
