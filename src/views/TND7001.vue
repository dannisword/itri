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
    <!-- 設定自動叫單 -->
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
        <el-table-column label="站點代碼" prop="id"> </el-table-column>
        <el-table-column label="站點名稱" prop="description"> </el-table-column>
        <el-table-column label="叫單數" prop="docCount">
          <template slot-scope="scope">
            <el-input v-model="scope.row.docCount" size="mini"></el-input>
          </template>
        </el-table-column>
      </el-table>
    </ModalDialog>
    <!-- 開工預先叫單 -->
    <ModalDialog
      :title="dialogs.preInBound.title"
      :name="dialogs.preInBound.name"
      :visible.sync="dialogs.preInBound.visible"
      @afterClosed="onPreInboundClose"
      :optional="optional"
    >
      <h3>{{ preInBound.message }}</h3>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { importInBound, setInbound, preInBound } from "@/api/inbound";
import { getWorkStation } from "@/api/workStation";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      receive: {},
      preInBound: {},
      workStations: [],
      optional: {
        size: "Small",
        action: "儲存設定",
        cancel: "取消",
        showAction: true,
      },
      dialogs: {
        setting: {
          title: "設定自動叫單數",
          name: " SETTING",
          visible: false,
        },
        preInBound: {
          title: "開工預先叫單",
          name: " SETTING",
          visible: false,
        },
      },
    };
  },
  created() {
    getWorkStation().then((resp) => {
      if (resp.message) {
        for (let station of resp.message) {
          station.docCount = 0;
        }
        this.workStations = resp.message;
      }
    });
  },
  methods: {
    onAction() {},
    onImport() {
      importInBound().then((resp) => {
        this.receive = resp.message;
      });
    },
    onSetting() {
      this.dialogs.setting.visible = true;
    },
    onPerInvoke() {
      preInBound(false).then((resp) => {
        if (resp.status == "OK") {
          this.preInBound = resp.message;
          this.dialogs.preInBound.visible = true;
        }
      });
    },
    onSettingClose(val) {
      this.dialogs.setting.visible = false;
      if (val.success == undefined || val.success == false) {
        return;
      }
      setInbound(this.workStations).then((resp) => {
        if (resp.status == "OK") {
          this.success("設定自動叫單數成功");
        }
      });
    },
    onPreInboundClose(val) {
      this.dialogs.preInBound.visible = false;
      if (val.success == undefined || val.success == false) {
        return;
      }
      preInBound(true).then((resp) => {
        console.log(resp);
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
    background: #409eff;
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
