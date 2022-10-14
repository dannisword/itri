<template>
  <div class="app-container">
    <div>
      <el-button type="primary" @click="onEdit()">編輯</el-button>
    </div>
    <el-table
      ref="workStations"
      :data="workStations"
      class="table-container"
      border
      height="100%"
    >
      <el-table-column label="站點代碼" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="站點名稱" prop="description" fixed>
      </el-table-column>
      <el-table-column label="入庫作業" width="100" prop="inBound">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.inBound"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="出庫作業" width="100" prop="outBound">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.outBound"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="加工作業" width="100" prop="process">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.process"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="盤點作業" width="100" prop="inventory">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.inventory"></el-checkbox>
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

import { getWorkStation, settWorkStations } from "@/api/workStation";
export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      data: [],
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
      this.data = resp.message;
      this.data.forEach((elm) => {
        let inBound = false;
        let outBound = false;
        let process = false;
        let inventory = false;

        elm.modelConfig.forEach((p) => {
          if (p.name == "入庫作業") {
            inBound = p.isEnable;
          }
          if (p.name == "出庫作業") {
            outBound = p.isEnable;
          }
          if (p.name == "加工作業") {
            process = p.isEnable;
          }
          if (p.name == "盤點作業") {
            inventory = p.isEnable;
          }
        });
        this.workStations.push({
          id: elm.id,
          description: elm.description,
          bufferLimit: elm.bufferLimit,
          emptyLimit: elm.emptyLimit,
          ipAddress: elm.ipAddress,
          isEnable: elm.isEnable,
          currentModel: elm.currentModel,
          inBound: inBound,
          outBound: outBound,
          process: process,
          inventory: inventory,
        });
      });
    },
    async onEdit() {
      //  資料轉換
      var stations = [];
      this.workStations.forEach((elm) => {
        let modelConfig = [];
        modelConfig.push({
          name: "入庫作業",
          isEnable: elm.inBound,
          isShow: false,
        });
        modelConfig.push({
          name: "出庫作業",
          isEnable: elm.outBound,
          isShow: false,
        });
        modelConfig.push({
          name: "加工作業",
          isEnable: elm.process,
          isShow: false,
        });
        modelConfig.push({
          name: "盤點作業",
          isEnable: elm.inventory,
          isShow: false,
        });
        stations.push({
          id: elm.id,
          description: elm.description,
          bufferLimit: elm.bufferLimit,
          emptyLimit: elm.emptyLimit,
          ipAddress: elm.ipAddress,
          isEnable: elm.isEnable,
          currentModel: elm.currentModel,
          modelConfig: modelConfig,
        });
      });
      //
      this.data.forEach((elm) => {
        elm.modelConfig.forEach((p) => {
          if (p.name == "入庫作業") {
            elm.isEnable = p.inBound;
          }
          if (p.name == "出庫作業") {
            elm.isEnable = p.outBound;
          }
          if (p.name == "加工作業") {
            elm.isEnable = p.process;
          }
          if (p.name == "盤點作業") {
            elm.isEnable = p.inventory;
          }
        });
      });
      const response = await settWorkStations(stations);
      console.log(response);
      if (response.status == "OK") {
        this.success("站點異動成功");
      }
      await this.onLoad();
    },
  },
};
</script>
