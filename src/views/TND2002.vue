<template>
  <div class="app-container">
    <el-row>
      <el-col :span="20">
        <el-form :inline="true" label-width="260px">
          <el-form-item
            class="form-item-label-30 label-blue-color"
            label="請刷讀物流箱編號"
          >
            <el-input
              v-model="carrierId"
              placeholder="系統刷讀物流箱條碼"
              @keyup.enter.native="onShuttle"
              :disabled="isReadOnly() == true"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="onCallback()"
              :disabled="this.carrierId.length <= 0"
            >
              料盒連動測試
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="20">
        <p style="font-size: 30px; color: crimson">
          自動倉可用的總儲位數：{{ emptyCount }}個
        </p>
      </el-col>

      <el-col :span="20">
        <el-button type="primary" @click="dialogs.carrier.visible = true"
          >空箱入庫進度查詢</el-button
        >
      </el-col>
    </el-row>

    <!--  查詢 -->
    <Dialog @afterClosed="onModalClose" :optional="dialogs.carrier">
      <el-form :model="params" label-width="90px" :inline="true">
        <el-form-item label="站點">
          <el-select
            v-model="params.stationCode"
            multiple
            placeholder="請選擇"
            :disabled="workStation().length > 0"
          >
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
          <el-date-picker v-model="nowDate" type="date"> </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
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
        v-loading="loading"
        class="table-container"
        border
        stripe
      >
        <el-table-column label="項次" width="100" prop="seq" fixed>
        </el-table-column>
        <el-table-column label="站點" prop="stationCode" min-width="180" fixed>
        </el-table-column>
        <el-table-column label="物流箱編號" prop="carrierId" min-width="180">
        </el-table-column>
        <el-table-column label="儲位編號" prop="storageCode" min-width="180">
        </el-table-column>
        <el-table-column label="收到指令時間" prop="createTime" min-width="180">
        </el-table-column>
        <el-table-column label="完成指令時間" prop="finishTime" min-width="180">
        </el-table-column>
        <el-table-column label="進度" prop="carrierStatusName" min-width="180">
        </el-table-column>
      </el-table>
    </Dialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import Dialog from "@/components/ModalDialog/Dialog.vue";
import pageMixin from "@/utils/mixin";
import mqtt_message from "@/utils/mixin/mqtt_message";
import { getWorkStations } from "@/api/workStation";
import { getEmptyCount } from "@/api/station";
import { getEmptyRecords, setShuttle } from "@/api/inbound";
export default {
  components: {
    ModalDialog,
    Dialog,
  },
  mixins: [pageMixin, mqtt_message],
  data() {
    return {
      funcName: "空箱入庫",
      nowDate: "",
      carrierId: "",
      loading: false,
      content: [],
      workStations: [],
      emptyCount: 0,
      params: {
        direction: "ASC",
        endDate: "",
        page: 1,
        properties: "id",
        size: 50,
        startDate: "",
        stationCode: [],
      },
      dialogs: {
        carrier: {
          title: "空箱入庫進度查詢",
          name: "CARRIER",
          visible: false,
          size: "Large",
          action: "",
          cancel: "",
          showAction: false,
        },
      },
    };
  },
  async created() {
    this.nowDate = this.toShortDate();
    getWorkStations().then((resp) => {
      if (resp.message) {
        this.workStations = resp.message;
      }
    });
    // 站點綁定
    if (this.workStation().length > 0) {
      this.params.stationCode.push(this.workStation());
      // mqtt
      this.connect(this.funcName);
      this.client.on("message", this.handleMessage);
    }
    // 取得空儲位數量
    this.getEmptyCount();
  },
  methods: {
    getEmptyCount() {
      getEmptyCount().then((resp) => {
        if (resp.status != "OK") {
          return;
        }
        this.emptyCount = resp.message.emptyCount;
      });
    },
    onLoad() {
      this.loading = true;
      this.params.startDate = this.toDate(this.nowDate);
      this.params.endDate = this.toDate(this.nowDate);
      const query = this.getQuery(this.params);
      // 取得空箱入庫進度
      getEmptyRecords(query)
        .then((resp) => {
          if (resp.status == "OK") {
            this.content = resp.message.content;
            // 分頁設定
            this.setPagination(resp.message);
            // 處理項次
            for (let item of this.content) {
              this.page.seq++;
              item.seq = this.page.seq;
            }
            this.loading = false;
          }
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    onShuttle() {
      setShuttle(this.carrierId)
        .then((resp) => {
          if (resp.status == "OK") {
            this.success("指令接收成功，已安排空箱入庫作業");
            this.getEmptyCount();
          }
          this.carrierId = "";
        })
        .catch((e) => {
          //this.carrierId = "";
        });
    },
    onModalClose(val) {
      if (val.success == undefined) {
        this.dialogs.carrier.visible = false;
      }
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
    onCallback() {
      this.carrierCallback(this.carrierId);
    },
    handleMessage(topic, message) {
      const val = JSON.parse(message);

      const dt = this.toDateTime(Date());
      //console.log(`2.訂閱主旨: ${topic}`);
      //console.log(`3.訂閱內容: ${message}`);
      const sub = `[${this.funcName} (${dt})] subscribe to topics ${topic}`;
      console.log(sub);
      console.log(message.toString());
      this.carrierId = val.carrier;
      this.onShuttle();
    },
  },
  beforeDestroy() {
    const dt = this.toDateTime(Date());
    if (this.client && this.workStation().length > 0) {
      const sub = `[${this.funcName} (${dt})] mqtt disconnect success`;
      console.log(sub);
      this.client.end();
    }
  },
};
</script>
<style>
.el-dialog__body {
  padding: 10px 20px;
}
</style>
