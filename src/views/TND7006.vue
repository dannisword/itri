<template>
  <div class="app-container">
    <div>
      <el-button type="primary" @click="idEdit = true" v-if="idEdit == false"
        >編輯</el-button
      >
      <el-button type="primary" @click="onEdit()" v-if="idEdit == true"
        >存檔</el-button
      >
      <el-button type="" @click="idEdit = false" v-if="idEdit == true"
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
      <el-table-column label="站點代碼" width="100" prop="id">
      </el-table-column>
      <el-table-column label="站點名稱" prop="description">
      </el-table-column>
      <el-table-column label="入庫作業" width="100" prop="inBound">
        <template slot-scope="scope">
          <el-checkbox
            class="remarks"
            v-model="scope.row.isInboundEnable"
            v-if="scope.row.isInboundShow"
            :disabled="idEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="出庫作業" width="100" prop="outBound">
        <template slot-scope="scope">
          <el-checkbox
            class="remarks"
            v-model="scope.row.isOutboundEnable"
            v-if="scope.row.isOutboundShow"
            :disabled="idEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="加工作業" width="100" prop="process">
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isProcessEnable"
            v-if="scope.row.isProcessShow"
            :disabled="idEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="盤點作業" width="100" prop="inventory">
        <template slot-scope="scope">
          <el-checkbox
            v-model="scope.row.isInventoryEnable"
            v-if="scope.row.isInventoryShow"
            :disabled="idEdit == false"
          ></el-checkbox>
        </template>
      </el-table-column>

      <el-table-column label="空箱出庫箱數限制" width="180" prop="emptyLimit">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.emptyLimit"
            size="mini"
            style="width: 120px"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="緩衝區箱數限制" width="180" prop="bufferLimit">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.bufferLimit"
            size="mini"
            style="width: 120px"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="站點對應IP" width="220" prop="ipAddress">
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.ipAddress"
            size="mini"
            style="width: 180px"
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
      idEdit: false,
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
      const response = await setWorkStations(this.workStations);
      console.log(response);
      if (response.status == "OK") {
        this.success("站點異動成功");
      }
      await this.onLoad();
    },
  },
};
</script>
<style lang="scss" scoped>
.remarks,
.el-checkbox__input,
.is-disabled,
.is-checked,
.el-checkbox__inner {
  border-color: black;
}
</style>
