<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form ref="params" :model="params" label-width="100px" :inline="true">
        <el-form-item label="更新日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="物流箱編號">
          <el-input v-model="params.carrierId"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
          <el-button type="success" @click="onNav('/TND7008')"
            >回列表</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- 功能鍵及分頁-->
    <el-row type="flex" class="mt-1">
      <el-col :span="16"> </el-col>
      <el-col :span="8" align="end">
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
    <!--  -->

    <el-table
      :data="content"
      v-loading="loading"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
    >
      <el-table-column label="項次" width="80" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="物流箱編號"
        width="180"
        prop="carrierId"
        fixed
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="歷程內容"
        min-width="280"
        prop="message"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="感測器編號"
        width="180"
        prop="stationCode"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="更新時間"
        width="180"
        prop="createTime"
        sortable="custom"
      >
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
// 物流箱歷程查詢
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getShuttles } from "@/api/carrier";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      nowDate: [],
      content: [],
      params: {
        carrierId: "",
        direction: "DESC",
        endDate: "",
        page: 1,
        properties: "createTime",
        size: 50,
        startDate: "",
      },
    };
  },
  created() {
    this.nowDate.push(this.addDay(-7));
    this.nowDate.push(this.addDay(0));
    //this.nowDate.push("2022-04-01");
    //this.nowDate.push("2022-05-31");
  },
  methods: {
    onLoad() {
      this.loading = true;
      this.params.startDate = this.toDate(this.nowDate[0]);
      this.params.endDate = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);
      getShuttles(query)
        .then((respone) => {
          if (respone.status == "OK") {
            this.content = respone.message.content;
            // 分頁設定
            this.setPagination(respone.message);
            // 處理項次
            for (let item of this.content) {
              this.page.seq++;
              item.seq = this.page.seq;
            }
          } else {
            this.warning(respone.errorMessage);
          }
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    onSortcChange(val) {
      this.params.direction = "ASC";
      if (val.order == "descending") {
        this.params.direction = "DESC";
      }
      this.params.properties = val.prop;
      this.onLoad();
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
  },
};
</script>
