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
            :disabled="workStation().length > 0"
          >
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-divider class="form-divider"></el-divider>
        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
          <el-button
            type="success"
            @click="onOpen('IN')"
            :disabled="isReadOnly() == true"
          >
            執行今日簽入
          </el-button>
          <el-button
            type="warning"
            @click="onOpen('OUT')"
            :disabled="isReadOnly() == true"
            >執行今日簽出
          </el-button>
          <el-button @click="onSync" type="info">同步員工資料</el-button>
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
          layout="total,jumper,prev,pager,next,sizes"
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
      @onExecute="isSync = true"
      :optional="Medium"
    >
      <el-row :gutter="20">
        <el-col :span="12"> 站點：{{ workStation() }} </el-col>
        <el-col :span="12"> 已勾選人員：{{ station.signInCount }} </el-col>
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
        <div class="mt-1">
          <el-button @click="onDefaultLast()">勾選上一次簽入者</el-button>
          <el-button
            @click="onConfirm('IN')"
            type="primary"
            :disabled="isReadOnly() == true"
          >
            確認簽入
          </el-button>
        </div>
      </el-form>

      <el-table
        ref="signInTable"
        :data="emps"
        class="table-container"
        border
        stripe
        height="480px"
        @selection-change="onSelectionInChange"
      >
        <el-table-column
          type="selection"
          :selectable="checkSelectable"
        ></el-table-column>

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
        <el-table-column label="簽入站點" prop="todaySignInWorkStationId">
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
          <el-col :span="12"> 站點：{{ workStation() }} </el-col>
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
              @click="getSingIn"
            ></el-button>
          </el-input>
          <div>
            <el-button @click="onSelectAll()">勾選全部簽入者</el-button>
            <el-button
              @click="onConfirm('OUT')"
              type="danger"
              :disabled="isReadOnly() == true"
            >
              確認簽出
            </el-button>
          </div>
        </el-form>
      </div>

      <el-table
        :data="emps"
        ref="signOutTable"
        class="table-container"
        border
        stripe
        height="480px"
        @selection-change="onSelectionOutChange"
      >
        <el-table-column type="selection"></el-table-column>
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
          <el-col :span="13" type="flex" justify="end" style="color: red">
            每天23:59:59 自動簽出人員，並記錄簽出時間為23:59:59
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="6"> 已簽入人數：{{ station.signInCount }} </el-col>
          <el-col :span="6"> 已簽出人數：{{ station.signOutCount }} </el-col>
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
  </div>
</template>

<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import {
  getSignRecord,
  getSignStatistics,
  getEmployees,
  setSignIn,
  setSignOut,
  syncEmployee,
  getTodaySignIn,
} from "@/api/station";
import { SelectTypeEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      isSync: false,
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
        direction: "DESC",
        properties: "signInDate",
      },
      station: {
        name: "",
        signInCount: 0,
        signIns: [],
        signOutCount: 0,
        signOuts: [],
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
    // 不顯示 Dialog 功能鍵
    this.Medium.showAction = false;

    this.nowDate.push(new Date());
    this.nowDate.push(new Date());
    this.getSelector(SelectTypeEnum.WORK_STATION).then((resp) => {
      this.options = resp;
    });
    // 站點綁定
    if (this.workStation().length > 0) {
      this.params.workStationId.push(this.workStation());
    }
    this.onLoad();
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
      this.station.signInCount = 0;
      this.station.signOutCount = 0;
      var p = {
        endDate: val.signInDate,
        startDate: val.signInDate,
        workStationId: val.workStationId,
      };
      const query = this.getQuery(p);
      getSignRecord(query).then((resp) => {
        if (resp.status == "OK") {
          this.dts = resp.message;

          this.Large.showAction = false;
          this.dialogs.log.visible = true;

          const sign_in = this.dts.filter((x) => x.signInDate != null);
          const sign_out = this.dts.filter((x) => x.signOutDate != null);

          this.station.signInCount = sign_in.length;
          this.station.signOutCount = sign_out.length;
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
    onSync() {
      syncEmployee().then((resp) => {
        if (resp.status == "OK") {
          this.isSync = false;
          this.success("已同步員工資料");
        } else {
          this.warning("同步員工資料異常");
        }
      });
    },
    onSerach() {
      this.emps = [];
      const p = {
        empolyeeId: this.empolyeeId,
        workStationId: this.workStation(),
      };
      const query = this.getQuery(p);
      getEmployees(query).then((resp) => {
        if (resp.title == "successful") {
          this.emps = resp.message;
          this.$nextTick(function () {
            for (let emp of this.emps) {
              if (
                emp.todaySignInWorkStationId != null &&
                emp.todaySignInWorkStationId != this.workStation()
              ) {
                continue;
              }
              this.$refs.signInTable.toggleRowSelection(emp, emp.todaySignIn);
            }
          });
        }
      });
    },
    onOpen(val) {
      this.emps = [];
      this.empolyeeId = "";
      // 簽入
      if (val == "IN") {
        this.isSync = false;
        this.dialogs.IN.visible = true;
        this.onSerach();
      }
      // 簽出
      if (val == "OUT") {
        this.getSingIn();
        this.dialogs.OUT.visible = true;
      }
    },
    onDefaultLast() {
      this.emps.forEach((element) => {
        if (
          element.haveSignInBefore == true &&
          element.todaySignInWorkStationId == null
        ) {
          console.log(element);
          this.$refs.signInTable.toggleRowSelection(element, true);
        }
      });
    },
    onSelectAll() {
      this.emps.forEach((element) => {
        this.$refs.signOutTable.toggleRowSelection(element, true);
      });
    },
    async onConfirm(val) {
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
        const data = [];

        for (let item of this.station.signIns) {
          // 排除簽入過的
          if (item.todaySignInWorkStationId != null) {
            continue;
          }
          data.push(item.employeeId);
        }

        setSignIn(data).then((resp) => {
          if (resp.status == "OK") {
            this.success("簽入成功");
            this.onLoad();
          } else {
            this.warning("簽入失敗");
          }
        });
        this.dialogs.IN.visible = false;
      }
      if (val == "OUT") {
        const data = [];
        for (let item of this.station.signOuts) {
          data.push(item.employeeId);
        }
        setSignOut(data).then((resp) => {
          if (resp.status == "OK") {
            this.success("簽出成功");
            this.onLoad();
          } else {
            this.warning("簽出失敗");
          }
        });
        this.dialogs.OUT.visible = false;
      }
    },
    getSingIn() {
      getTodaySignIn().then((resp) => {
        if (resp.status == "OK") {
          if (this.empolyeeId.length > 0) {
            this.emps = resp.message.filter(
              (x) => x.employeeId == this.empolyeeId
            );
            console.log(this.empolyeeId);
            //this.emps = emps;
          } else {
            this.emps = resp.message;
          }
        }
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
    onSelectionInChange(val) {
      this.station.signInCount = val.length;
      this.station.signIns = val;
    },
    onSelectionOutChange(val) {
      this.station.signOutCount = val.length;
      this.station.signOuts = val;
    },
    checkSelectable(val) {
      if (
        val.todaySignInWorkStationId != null &&
        val.todaySignInWorkStationId != this.workStation()
      ) {
        return false;
      }
      return !val.todaySignIn;
    },
  },
};
</script>
