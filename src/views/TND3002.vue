<template>
  <div class="app-container">
    <el-row>
      <el-col :span="20">
        <el-form :inline="true" label-width="260px">
          <el-form-item
            class="form-item-label-30 label-blue-color"
            label="輸入出庫空箱箱數"
          >
            <el-input
              v-model="qty"
              placeholder="輸入出庫空箱箱數"
              type="number"
              min="1"
              @keyup.enter.native="onShuttle"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="onShuttle()"
              :disabled="isRunning == true || isReadOnly() == true"
              >空箱出庫</el-button
            >
            <el-button type="danger" @click="onStop()" v-if="isRunning == true"
              >後續中止</el-button
            >
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="20">
        <p style="font-size: 30px; color: crimson">
          自動倉可用的總儲位數：{{ emptyCount }}個
        </p>
      </el-col>
      <el-col :span="20">
        <el-button type="primary" @click="onOpen"
          >空箱出庫進度查詢</el-button
        >
      </el-col>
    </el-row>

    <Dialog @afterClosed="onModalClose" :optional="dialogs.carrier">
      <el-form :model="params" :inline="true">
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
        v-loading="loading"
        class="table-container"
        border
        stripe
      >
        <el-table-column label="項次" width="100" prop="seq" fixed>
        </el-table-column>
        <el-table-column label="站點" prop="stationCode" width="180">
        </el-table-column>
        <el-table-column label="物流箱編號" prop="carrierId" min-width="180"> </el-table-column>
        <el-table-column label="儲位編號" prop="storageCode" min-width="180">
        </el-table-column>
        <el-table-column label="收到指令時間" prop="createTime" min-width="125">
        </el-table-column>
        <el-table-column label="完成指令時間" prop="finishTime" min-width="125">
        </el-table-column>
        <el-table-column label="進度" prop="carrierStatusName" min-width="125">
        </el-table-column>
      </el-table>
    </Dialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import Dialog from "@/components/ModalDialog/Dialog.vue";
import pageMixin from "@/utils/mixin";
import { getWorkStations } from "@/api/workStation";
import { getEmptyCount } from "@/api/carrier";
import { getShuttle, getEmptyRecords, stopOutbound } from "@/api/outbound";

export default {
  components: {
    ModalDialog,
    Dialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      nowDate: "",
      loading: false,
      content: [],
      workStations: [],
      emptyCount: "",
      qty: 0,
      isRunning: false,
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
          title: "空箱出庫進度查詢",
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
  created() {
    this.nowDate = this.toShortDate();
    getWorkStations().then((resp) => {
      if (resp.message) {
        this.workStations = resp.message;
      }
    });
    // 站點綁定
    if (this.workStation().length > 0) {
      this.params.stationCode.push(this.workStation());
    }

    this.onQuery();
  },
  methods: {
    onLoad() {
      this.loading = true;
      this.params.startDate = this.toDate(this.nowDate);
      this.params.endDate = this.toDate(this.nowDate);
      const query = this.getQuery(this.params);
      getEmptyRecords(query)
        .then((resp) => {
          console.log(resp);
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
    onOpen(){
      this.dialogs.carrier.visible = true;
      this.onLoad();
    },
    onQuery() {
      // A2-17, 取得空箱數量
      getEmptyCount().then((resp) => {
        if (resp.status != "OK") {
          return;
        }
        this.emptyCount = resp.message.emptyCount;
      });
    },
    onShuttle() {
      this.onQuery();
      if (this.qty <= 0) {
        this.warning("請填寫箱數，才能進行空箱出庫作業");
        return;
      }
      //
      if (this.qty > this.emptyCount) {
        this.warning("庫內空箱數不足！");
        return;
      }
      // 空箱出庫
      this.isRunning = false;
      getShuttle(this.qty).then((resp) => {
        if (resp.status == "OK") {
          this.success("指令接收成功，已安排空箱出庫作業");
        }
      });
    },
    onStop() {
      this.isRunning = false;
      // 後續中止
      console.log(this.workStation());
      stopOutbound(this.workStation()).then((resp) => {
        if (resp.title != "successful") {
          this.warning(resp.message);
        }
      });
    },
    onModalClose(val) {
      this.dialogs.carrier.visible = false;
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
  },
};
</script>
<style>
.el-dialog__body {
  padding: 10px 20px;
}
</style>
