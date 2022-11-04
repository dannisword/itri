<template>
  <div class="app-container">
    <div>
      <el-button type="primary" @click="isEdit = true" v-if="isEdit == false"
        >編輯</el-button
      >
      <el-button type="primary" @click="onEdit()" v-if="isEdit == true"
        >存檔</el-button
      >
      <el-button type="" @click="onCancel()" v-if="isEdit == true"
        >取消</el-button
      >
    </div>
    <el-table
      ref="workStations"
      :data="workStations"
      class="table-container"
      stripe
      border
      height="100vh"
    >
      <el-table-column label="站點代碼" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="站點名稱" prop="description" fixed>
      </el-table-column>

      <el-table-column
        label="現況作業模式"
        prop="currentModel"
        fixed
        width="180"
      >
      </el-table-column>
      <el-table-column label="入庫作業" width="100" prop="inBound">
        <template slot-scope="scope">
          <el-checkbox
            class="remarks"
            v-model="scope.row.isInboundEnable"
            v-if="scope.row.isInboundShow"
            :disabled="isEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="出庫作業" width="100" prop="outBound">
        <template slot-scope="scope">
          <el-checkbox
            class="remarks"
            v-model="scope.row.isOutboundEnable"
            v-if="scope.row.isOutboundShow"
            :disabled="isEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="加工作業" width="100" prop="process">
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isProcessEnable"
            v-if="scope.row.isProcessShow"
            :disabled="isEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="盤點作業" width="100" prop="inventory">
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isInventoryEnable"
            v-if="scope.row.isInventoryShow"
            :disabled="isEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>

      <el-table-column label="空箱出庫箱數限制" width="180" prop="emptyLimit">
      </el-table-column>
      <el-table-column label="緩衝區箱數限制" width="180" prop="bufferLimit">
      </el-table-column>
      <el-table-column label="站點對應IP" width="220" prop="ipAddress">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.ipAddress"
            size="mini"
            style="width: 180px"
            :disabled="isEdit == false"
          ></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";

import { getWorkStation, setWorkStations } from "@/api/workStation";
export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      isEdit: false,
      workStations: [],
    };
  },
  created() {
    this.onLoad();
  },
  methods: {
    async onLoad() {
      this.workStations = [];
      let resp = await getWorkStation();
      this.workStations = resp.message;
    },
    async onEdit() {
      this.isEdit = false;
      const response = await setWorkStations(this.workStations);
      if (response.status == "OK") {
        this.success("站點異動成功");
      }
      await this.onLoad();
    },
    async onCancel() {
      this.isEdit = false;
      await this.onLoad();
    },
  },
};
</script>
<style type="sass" scoped>
.input:disabled {
  background-color: black;
  color: linen;
  opacity: 1;
}
</style>
