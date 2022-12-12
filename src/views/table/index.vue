<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form ref="form" :model="form" label-width="80px" :inline="true">
        <el-form-item label="簽入日期">
          <el-date-picker
            v-model="value1"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="站別">
          <el-select v-model="value" placeholder="请选择">
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
          <el-button type="primary">查詢</el-button>
          <el-button type="success" @click="handlerLogout()"
            >執行今日簽入</el-button
          >
          <el-button type="warning">執行今日簽出</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- -->
    <el-table
      class="table-container"
      :data="tableData"
      border
      stripe
      header-cell-class-name="table-header"
    >
      <el-table-column prop="seq" label="項次" width="100" align="center">
      </el-table-column>
      <el-table-column prop="date" label="簽入日期" width="180" align="center">
      </el-table-column>
      <el-table-column prop="station" label="站別" align="center">
      </el-table-column>
      <el-table-column prop="inNum" label="簽入總人數" align="center">
      </el-table-column>
      <el-table-column prop="outNum" label="簽出總人數" align="center">
      </el-table-column>
      <el-table-column
        prop="action"
        label="查詢簽到紀錄"
        width="150"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleAction(scope.$index, scope.row)"
            >查詢</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 
    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="Title">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="Author" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Pageviews" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.pageviews }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Status" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="Display_time" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
    </el-table>
-->
  </div>
</template>

<script>
import { getList } from "@/api/table";
import { clearStorageItem } from "@/utils/localStorage";

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "gray",
        deleted: "danger",
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      list: null,
      listLoading: true,
      value1: [],
      value: "A001",
      options: [
        {
          value: "A001",
          label: "A001",
        },
        {
          value: "A002",
          label: "A002",
        },
        {
          value: "A003",
          label: "A003",
        },
        {
          value: "A004",
          label: "A004",
        },
        {
          value: "A005",
          label: "A005",
        },
      ],
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: "",
      },
      tableData: [
        {
          seq: 1,
          date: "2022-05-02",
          station: "A001",
          inNum: 10,
          outNum: 10,
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          seq: 2,
          date: "2022-05-04",
          station: "A002",
          inNum: 9,
          outNum: 9,
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄",
        },
        {
          seq: 3,
          date: "2022-05-01",
          station: "A003",
          inNum: 12,
          outNum: 12,
          name: "王2小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
        {
          seq: 4,
          date: "2022-05-03",
          station: "A004",
          inNum: 10,
          outNum: 10,
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
        {
          seq: 5,
          date: "2022-05-03",
          station: "A005",
          inNum: 13,
          outNum: 12,
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
      ],
    };
  },
  created() {
    this.value1.push(new Date());
    this.value1.push(new Date());

  },
  methods: {
    handlerLogout() {
      clearStorageItem();
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    handleAction() {
      this.$router.push("/login");
    },
    fetchData() {
      this.listLoading = true;
      getList().then((response) => {
        this.list = response.data.items;
        this.listLoading = false;
      });
    },
  },
};
</script>
<style>
.questItem {
  border: solid;
  padding: 18px;
  border-radius: 12px;
  border-color: #e0e0e0;
}
</style>
