<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="80px" :inline="true">
        <el-form-item label="簽入日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="站別">
          <el-select
            v-model="params.workStationId"
            multiple
            placeholder="請選擇"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-divider class="form-divider"></el-divider>
        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
          <el-button type="success" @click="onOpen('IN')"
            >執行今日簽入</el-button
          >
          <el-button type="warning" @click="onOpen('OUT')"
            >執行今日簽出</el-button
          >
        </el-form-item>
      </el-form>
    </div>

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

    <!-- 資料 -->
    <el-table
      :data="records"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
    >
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="簽入日期"
        prop="signInDate"
        width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="站別" prop="workStationId" sortable="custom">
      </el-table-column>
      <el-table-column label="簽入總人數" prop="signInCount" width="125">
      </el-table-column>
      <el-table-column label="簽出總人數" prop="signOutCount" width="125">
      </el-table-column>
      <el-table-column label="編輯權限" width="200" align="center">
        <template slot-scope="scope">
          <el-button @click="onDetail(scope.row)" size="mini" type="primary"
            >查詢
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 今日簽入作業 -->
    <ModalDialog
      :title="dialogs.IN.title"
      :name="dialogs.IN.name"
      :visible.sync="dialogs.IN.visible"
      @afterClosed="onModalClose"
      :optional="Medium"
    >
      <el-row :gutter="20">
        <el-col :span="8"> 站點：{{ station.name }} </el-col>
        <el-col :span="8"> 已勾選人員：{{ station.signIn }} </el-col>
      </el-row>

      <el-form label-width="80px" :inline="true">
        <el-input
          placeholder="請輸入工號"
          v-model="empolyeeId"
          class="input-with-select"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="onSerach"
          ></el-button>
        </el-input>
        <div>
          <el-button @click="onDefaultLast()">勾選上一次簽入者</el-button>
          <el-button @click="onConfirm('IN')" type="primary"
            >確認簽入</el-button
          >
        </div>
      </el-form>

      <el-table
        :data="emps"
        class="table-container"
        border
        stripe
        height="480px"
      >
        <el-table-column label="今日簽入" prop="selected">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.selected"></el-checkbox>
          </template>
        </el-table-column>

        <el-table-column label="上一次簽入者" prop="haveSignInBefore">
          <template slot-scope="scope">
            <el-checkbox
              v-model="scope.row.haveSignInBefore"
              disabled
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="員工編號" prop="employeeId"> </el-table-column>
        <el-table-column label="員工姓名" prop="employeeName">
        </el-table-column>
      </el-table>
    </ModalDialog>

    <!-- 今日簽出作業 -->
    <ModalDialog
      :title="dialogs.OUT.title"
      :name="dialogs.OUT.name"
      :visible.sync="dialogs.OUT.visible"
      @afterClosed="onModalClose"
      :optional="Medium"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="6"> 站點：{{ station.name }} </el-col>
        </el-row>
        <el-form label-width="80px" :inline="true">
          <el-input
            placeholder="請輸入工號"
            v-model="empolyeeId"
            class="input-with-select"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="onSerach"
            ></el-button>
          </el-input>
          <div>
            <el-button @click="onSelectAll()">勾選全部簽入者</el-button>
            <el-button @click="onConfirm('OUT')" type="danger"
              >確認簽出</el-button
            >
          </div>
        </el-form>
      </div>

      <el-table
        :data="emps"
        class="table-container"
        border
        stripe
        height="480px"
      >
        <el-table-column label="今日簽出" prop="selected">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.selected"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="員工編號" prop="employeeId"></el-table-column>
        <el-table-column label="員工姓名" prop="employeeName">
        </el-table-column>
      </el-table>
    </ModalDialog>

    <!-- 查詢簽到紀錄 -->
    <ModalDialog
      :title="dialogs.log.title"
      :name="dialogs.log.name"
      :visible.sync="dialogs.log.visible"
      @afterClosed="onModalClose"
      :optional="Large"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="6"> 站點：{{ station.name }} </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6"> 已簽入人數：{{ station.signIn }} </el-col>
          <el-col :span="6"> 已簽出人數：{{ station.signOut }} </el-col>
        </el-row>
      </div>

      <el-table
        :data="dts"
        class="table-container"
        border
        stripe
        height="400px"
      >
        <el-table-column label="員工編號" prop="employeeId"> </el-table-column>
        <el-table-column label="員工姓名" prop="employeeName">
        </el-table-column>
        <el-table-column label="簽入時間" prop="signInDate"> </el-table-column>
        <el-table-column label="簽出時間" prop="signOutDate"> </el-table-column>
      </el-table>
    </ModalDialog>
    <!-- 
    <ModalDialog
      :title="dialogs.log.title"
      :name="dialogs.log.name"
      :visible.sync="dialogs.log.visible"
      @afterClosed="onModalClose"
    >
      請問是否確定簽入
    </ModalDialog>
    -->
  </div>
</template>

<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getSelector } from "@/api/system";
import {
  getSignRecord,
  getSignStatistics,
  getEmployees,
  setSignIn,
  setSignOut,
} from "@/api/station";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      options: [],
      nowDate: [],
      records: [],
      emps: [],
      outs: [],
      dts: [],
      empolyeeId: "",
      params: {
        endDate: "",
        startDate: "",
        workStationId: [],
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
      station: {
        name: "",
        signIn: 0,
        signOut: 0,
      },
      dialogs: {
        log: {
          title: "查詢簽到紀錄",
          name: "LOG",
          visible: false,
        },
        IN: {
          title: "今日簽入作業",
          name: "IN",
          visible: false,
        },
        OUT: {
          title: "今日簽出作業",
          name: "OUT",
          visible: false,
        },
      },
    };
  },
  created() {
    this.Large.showAction = false;
    this.Medium.showAction = false;
    this.nowDate.push(new Date());
    this.nowDate.push(new Date());
    getSelector("WORK_STATION").then((resp) => {
      this.options = resp.message;
    });
  },
  methods: {
    onLoad() {
      this.params.startDate = this.toDate(this.nowDate[0]);
      this.params.endDate = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);

      getSignStatistics(query).then((resp) => {
        if (resp.status == "OK") {
          this.records = resp.message.content;
          // 分頁設定
          this.setPagination(resp.message);
          console.log(this.page);
          // 處理項次
          for (let record of this.records) {
            this.page.seq++;
            record.seq = this.page.seq;
          }
        }
      });
    },
    onDetail(val) {
      this.station.name = val.workStationId;
      this.station.signIn = 0;
      this.station.signOut = 0;
      var p = {
        endDate: val.signInDate,
        startDate: val.signInDate,
        workStationId: val.workStationId,
      };
      const query = this.getQuery(p);
      getSignRecord(query).then((resp) => {
        if (resp.status == "OK") {
          this.dts = resp.message;
          this.dialogs.log.visible = true;

          const signIn = this.dts.filter((x) => x.signInDate != null);
          const signOut = this.dts.filter((x) => x.signOutDate != null);

          this.station.signIn = signIn.length;
          this.station.signOut = signOut.length;
        }
      });
    },
    onModalClose(val) {
      if (val.name == "LOG") {
        this.dialogs.log.visible = false;
      }
      if (val.name == "IN") {
        this.dialogs.IN.visible = false;
      }
      if (val.name == "OUT") {
        this.dialogs.OUT.visible = false;
      }
    },
    onSerach() {
      this.emps = [];
      const p = {
        empolyeeId: this.empolyeeId,
        workStationId: this.station.name,
      };
      const query = this.getQuery(p);
      getEmployees(query).then((resp) => {
        if (resp.status == "OK") {
          const data = resp.message;
          data.forEach((elm) => {
            const value = this.clone(elm);
            this.emps.push(value);
          });
        }
      });
    },
    onOpen(val) {
      this.emps = [];
      if (val == "IN") {
        this.dialogs.IN.visible = true;
      }
      if (val == "OUT") {
        this.dialogs.OUT.visible = true;
      }
      this.onSerach();
    },
    onDefaultLast() {
      const data = this.clone(this.emps);
      data.forEach((elm) => {
        elm.selected = elm.haveSignInBefore;
      });
      this.emps = data;
    },
    onSelectAll() {
      const data = this.clone(this.emps);
      data.forEach((elm) => {
        elm.selected = true;
      });
      console.log(data);
      this.emps = data;
    },
    async onConfirm(val) {
      const values = this.emps.filter((x) => x.selected == true);
      const data = [];
      values.forEach((elm) => {
        data.push(elm.employeeId);
      });
      let msg = "請問是否簽入？";
      if (val == "OUT") {
        msg = "請問是否簽出？";
      }
      // 是否新增提示
      const isConfirm = await this.confirm(msg);
      if (isConfirm == false) {
        return;
      }
      if (val == "IN") {
        await setSignIn(data);
        this.dialogs.IN.visible = false;
      }
      if (val == "OUT") {
        await setSignOut(data);
        this.dialogs.OUT.visible = false;
      }
      await this.onLoad();
    },
    handleClose() {},
    async onSortcChange(val) {
      this.params.direction = "ASC";
      if (val.order == "descending") {
        this.params.direction = "DESC";
      }
      this.params.properties = val.prop;
      await this.onLoad();
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
  },
};
</script>
