<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="100px" :inline="true">
        <el-form-item label="收單日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            @change="onDatePickeChang"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="作業站點">
          <el-select
            v-model="params.assignWorkStationId"
            multiple
            placeholder="請選擇"
            :disabled="workStation().length > 0"
          >
            <el-option
              v-for="item in workStations"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="入庫單狀態">
          <el-select v-model="params.docStatus" multiple placeholder="請選擇">
            <el-option
              v-for="item in inStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="收單來源">
          <el-select
            v-model="params.receiveSource"
            multiple
            placeholder="請選擇"
          >
            <el-option
              v-for="item in inSource"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="入庫單號碼">
          <el-input v-model="params.sysOrderNo"></el-input>
        </el-form-item>

        <el-form-item label="料品號">
          <el-input v-model="params.prodCode"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
        </el-form-item>

        <el-divider class="form-divider"></el-divider>
      </el-form>
    </div>

    <!-- 分頁 -->
    <el-row class="mt-1" type="flex">
      <el-col :span="10">
        入庫最新收單時間：{{ receiveInfo.lastDateTime }} 入庫最新收單數量：{{
          receiveInfo.lastCount
        }}單
      </el-col>
      <el-col :span="14" align="end">
        <el-pagination
          background
          @current-change="onCurrentChange"
          :current-page="page.number"
          :page-size="page.size"
          layout="total,jumper,prev,pager,next"
          :total="page.totalElements"
        ></el-pagination>
      </el-col>
    </el-row>

    <!-- 資料 -->
    <el-table
      :data="content"
      v-loading="loading"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
      @cell-dblclick="ondblClick"
    >
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="收單來源"
        prop="receiveSource"
        width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="入庫單號碼"
        prop="sysOrderNo"
        min-width="180"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="事務號"
        prop="transNo"
        min-width="125"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="料品號"
        prop="prodCode"
        min-width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="供應商"
        prop="supplier"
        min-width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="收料數量"
        prop="totalPlanQty"
        width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="入庫單狀態"
        prop="docStatusName"
        width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="綁定站點"
        prop="assignWorkStationId"
        width="125"
        sortable="custom"
      >
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import mqtt from "mqtt";
import Dialog from "@/components/ModalDialog/Dialog.vue";
import pageMixin from "@/utils/mixin";
import { getInbounds, startInbound } from "@/api/inbound";
import { getReceiveInfo } from "@/api/system";
import { SelectTypeEnum, RunModelEnum } from "@/utils/enums/index";

export default {
  components: {
    Dialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      content: [],
      workStations: [],
      nowDate: [],
      receiveInfo: {},
      params: {
        assignWorkStationId: "",
        direction: "ASC",
        docStatus: 0,
        page: 1,
        prodCode: "",
        properties: "id",
        receivedEndDateTime: "",
        receivedStartDateTime: "",
        receiveSource: "",
        size: 50,
        sysOrderNo: "",
      },
      inStatus: [],
      inSource: [],
      client: {},
      connection: {
        protocol: "tcp",
        host: "210.242.68.168",
        port: 1883,
        endpoint: "",
        clean: true,
        connectTimeout: 30 * 1000, // ms
        reconnectPeriod: 4000, // ms
        clientId: "itri_" + Math.random().toString(16).substring(2, 8),
        username: "",
        password: "",
      },
      subscription: {
        topic: "wms/itri",
        qos: 0,
      },
    };
  },
  async created() {
    this.nowDate.push(this.addDay(-30));
    this.nowDate.push(this.addDay(0));
    // 作業站點
    this.workStations = await this.getSelector(SelectTypeEnum.WORK_STATION);
    // 入庫單狀態
    this.inStatus = await this.getSelector(SelectTypeEnum.INBOUND_STATUS);
    // 收單來源
    this.inSource = await this.getSelector(SelectTypeEnum.INBOUND_SOURCE);
    // 站點綁定
    if (this.workStation().length > 0) {
      this.params.assignWorkStationId.push(this.workStation());
    }
    // 入庫資訊
    getReceiveInfo("入庫").then((resp) => {
      if (resp.status == "OK") {
        this.receiveInfo = resp.message;
      }
    });

    this.onLoad();
    //this.connect();
  },
  methods: {
    handleOnReConnect() {
      this.retryTimes += 1;
      if (this.retryTimes > 5) {
        try {
          this.client.end();

          //this.initData();
          //this.$message.error("Connection maxReconnectTimes limit, stop retry");
        } catch (error) {
          this.$message.error(error.toString());
        }
      }
    },
    connect() {
      try {
        const { protocol, host, port, endpoint, ...options } = this.connection;
        const connectUrl = `${protocol}://${host}:${port}`;
        this.client = mqtt.connect("ws://210.242.68.168:8083", {
          clean: true,
          defaultProtocol: "tcp",
          connectTimeout: 4000,
          reconnectPeriod: 1000,
          clientId: Math.random().toString(16).substring(2, 8),
          username: "",
          password: "",
        });
        console.log(this.client);

        const { topic, qos } = this.subscription;
        this.client.subscribe(topic, { qos }, (error, res) => {
          if (error) {
            console.log("Subscribe to topics error", error);
            return;
          }
          // this.subscribeSuccess = true;
          console.log("Subscribe to topics res", res);
        });

        this.client.on("message", function (topic, message) {
          // message is Buffer
          console.log(message.toString());
          //this.client.end();
        });
      } catch (e) {
        console.log("mqtt.connect error", e);
      }
    },
    onLoad() {
      this.loading = true;
      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params, false);
      getInbounds(query)
        .then((respone) => {
          if (respone.message) {
            this.content = respone.message.content;
            // 分頁設定
            this.setPagination(respone.message);
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
    async onSortcChange(val) {
      if (val.order == null) {
        return;
      }
      this.params.direction = val.order == "ascending" ? "ASC" : "DESC";
      this.params.properties = val.prop;
      await this.onLoad();
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
    ondblClick(val) {
      const canChang = this.handlePage(RunModelEnum.Inbound, "TND2100");
      if (canChang == true) {
        startInbound(val.sysOrderNo).then((resp) => {
          if (resp.status == "OK") {
            this.onNav(`/TND2100/${val.id}`);
          }
        });
      } else {
        this.warning("尚有入庫工作未完成！");
      }
    },
  },
};
</script>
<style></style>
