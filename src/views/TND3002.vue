<template>
  <div class="app-container">
    <div style="width: 320px">
      <el-form :model="params" label-width="180px" :inline="true">
        <el-form-item>
          <h2>輸入出庫空箱數</h2>
        </el-form-item>
        <el-form-item>
          <el-input v-model="params.sysOrderNo"></el-input>
        </el-form-item>
        <el-button type="primary" @click="onAction()">空箱出庫</el-button>

        <el-form-item>
          <p style="color: red">自動倉可用的總儲位數：70個</p>
        </el-form-item>

        <el-divider class="form-divider"></el-divider>

        <el-form-item>
          <el-button type="primary" @click="onLoad()"
            >空箱入庫進度查詢</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <ModalDialog
      :title="dialogs.carrier.title"
      :name="dialogs.carrier.name"
      :visible.sync="dialogs.carrier.visible"
      @afterClosed="onModalClose"
      :optional="optional"
    >
      <el-form :model="params" :inline="true">
        <el-form-item label="站點">
          <el-select v-model="params.assignWorkStationId" placeholder="請選擇">
            <el-option
              v-for="item in workStations"
              :key="item.id"
              :label="item.id"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="作業日期">
          <el-date-picker v-model="params.dateAt" type="date"> </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onLoad()"
            icon="el-icon-search"
          ></el-button>
        </el-form-item>
      </el-form>

      <!-- 分頁 -->
      <el-row type="flex">
        <el-col :span="8"> </el-col>
        <el-col :span="16" align="end">
          <el-pagination
            background
            @current-change="onCurrentChange"
            :current-page="page.number"
            :page-size="page.size"
            layout="total,jumper,prev, pager, next"
            :total="page.totalElements"
          ></el-pagination>
        </el-col>
      </el-row>

      <el-table
        :data="content"
        class="table-container"
        border
        stripe
        height="100%"
      >
        <el-table-column label="項次" width="100" prop="id" fixed>
        </el-table-column>
        <el-table-column label="站點" prop="code" width="180">
        </el-table-column>
        <el-table-column label="物流箱編號" prop="name"> </el-table-column>
        <el-table-column label="儲位編號" prop="statusName" width="125">
        </el-table-column>
        <el-table-column label="收到指令時間" prop="statusName" width="125">
        </el-table-column>
        <el-table-column label="完成指令時間" prop="statusName" width="125">
        </el-table-column>
        <el-table-column label="進度" prop="statusName" width="125">
        </el-table-column>
      </el-table>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getWorkStation } from "@/api/workStation";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      nowDate: "",
      content: [],
      workStations: [],
      params: {
        dateAt: "",
        assignWorkStationId: "",
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
      optional: {
        size: "Large",
        action: "",
        cancel: "",
        showAction: false,
      },
      dialogs: {
        carrier: {
          title: "空箱入庫進度查詢",
          name: "CARRIER",
          visible: false,
        },
      },
    };
  },
  created() {
    this.nowDate = this.toShortDate();
    getWorkStation().then((resp) => {
      if (resp.message) {
        this.workStations = resp.message;
      }
    });
  },
  methods: {
    onLoad() {
      this.dialogs.carrier.visible = true;
    },
    onAction() {},
    onModalClose(val) {
      this.dialogs.carrier.visible = false;
    },
  },
};
</script>
<style>
.el-dialog__body {
  padding: 10px 20px;
}
</style>
