<template>
  <div class="app-container">
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="8" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="onImport()">
          <div class="card-panel-description">
            <div class="card-panel-text">執行收單作業</div>
            <p>最新收單時間：{{ receive.receivedDateTime }}</p>
            <p>最新收單數量：{{ receive.count }}</p>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="8" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="onSetting()">
          <div class="card-panel-description">
            <div class="card-panel-text">設定自動叫單數</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="8" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="onPerInvoke()">
          <div class="card-panel-description">
            <div class="card-panel-text">開工預先叫單</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <ModalDialog
      :title="dialogs.setting.title"
      :name="dialogs.setting.name"
      :visible.sync="dialogs.setting.visible"
      destroy-on-close="true"
      @afterClosed="onSettingClose"
      :optional="optional"
    >
      <div>設定為0，則表示當天不開站點</div>
      <el-table
        :data="workStations"
        class="table-container"
        close-on-click-modal="false"
        border
        stripe
        height="400px"
      >
        <el-table-column label="站點代碼" prop="workStationCode">
        </el-table-column>
        <el-table-column label="站點名稱" prop="workStationName">
        </el-table-column>
        <el-table-column label="叫單數" prop="docCount">
          <template slot-scope="scope">
            <el-input v-model="scope.row.docCount" size="mini"></el-input>
          </template>
        </el-table-column>
      </el-table>
    </ModalDialog>

    <ModalDialog
      :title="dialogs.preProcess.title"
      :name="dialogs.preProcess.name"
      :visible.sync="dialogs.preProcess.visible"
      @afterClosed="onPreProcessClose"
      :optional="optional"
    >
      <h3>{{ preProcess.message }}</h3>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { importProcess, preProcess, getProcesses, setProcess } from "@/api/processing";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      receive: {},
      preProcess: {},
      workStations: [],
      optional: {
        size: "Small",
        action: "儲存設定",
        cancel: "取消",
      },
      dialogs: {
        setting: {
          title: "設定自動叫單數",
          name: " SETTING",
          visible: false,
        },
        preProcess: {
          title: "開工預先叫單",
          name: " SETTING",
          visible: false,
        },
      },
    };
  },
  created() {},
  methods: {
    onImport() {
      importProcess().then((resp) => {
        if (resp.message) {
          this.receive = resp.message;
        }
      });
    },
    onSetting() {
      getProcesses().then((resp) => {
        if (resp.message) {
          this.workStations = resp.message;
          this.dialogs.setting.visible = true;
        }
      });
    },
    onPerInvoke() {
      preProcess(false).then((resp) => {
        if (resp.status == "OK") {
          this.preProcess = resp.message;
          this.dialogs.preProcess.visible = true;
        }
      });
    },
    onSettingClose(val) {
      this.dialogs.setting.visible = false;
      if (val.success == false) {
        return;
      }
      setProcess(this.workStations).then((resp) => {
        if (resp.status == "OK") {
          this.success("設定自動叫單數成功");
        }
      });
    },
    onPreProcessClose(val) {
      this.dialogs.preProcess.visible = false;
      if (val.success == false) {
        return;
      }
      preProcess(true).then((resp) => {
        if (resp.status == "OK") {
          this.success("開工預先叫單");
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #fff;
    background: #002984;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: left;
      font-weight: bold;
      margin: 26px;
      margin-left: 18px;

      .card-panel-text {
        line-height: 18px;
        color: #fff;
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
