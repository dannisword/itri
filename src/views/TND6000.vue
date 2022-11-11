<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="100px" :inline="true">
        <el-form-item label="入庫日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            @change="onChang"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="料品號">
          <el-input v-model="params.prodCode"></el-input>
        </el-form-item>

        <el-form-item label="供應商">
          <el-input v-model="params.supplier"></el-input>
        </el-form-item>

        <el-form-item label="物流箱編號">
          <el-input v-model="params.carrierCode"></el-input>
        </el-form-item>

        <el-divider class="form-divider"></el-divider>
        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
        </el-form-item>
      </el-form>
    </div>

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
      :data="stocks"
      class="table-container"
      border
      stripe
      @sort-change="onSortChange"
    >
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="料品號"
        width="100"
        prop="prodCode"
        fixed
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="入庫時間"
        width="120"
        prop="entryDate"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="供應商" prop="supplier" sortable="custom">
      </el-table-column>
      <el-table-column label="數量" prop="availableQty" sortable="custom">
      </el-table-column>
      <el-table-column
        label="儲位編號"
        width="150"
        prop="stationId"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="物流箱編號"
        width="150"
        prop="carrierId"
        sortable="custom"
      >
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import moment from "moment";
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getStocks } from "@/api/stock";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      nowDate: [],
      params: {
        carrierCode: "", // 物流箱編號
        prodCode: "", // 商品代號
        supplier: "", //供應商代號
        startDate: "", // 入庫日期(起)
        endDate: "", // 入庫日期(訖)
        page: 1,
        size: 50,
        direction: "ASC",
        properties: "entryDate",
      },
      stocks: [],
    };
  },
  created() {
    this.nowDate.push(this.addDay(-60));
    this.nowDate.push(this.addDay(0));
    this.onLoad();
  },
  methods: {
    onLoad() {
      this.params.startDate = this.toDate(this.nowDate[0]);
      this.params.endDate = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);
      getStocks(query).then((respone) => {
        this.stocks = respone.message.content;
        // 分頁設定
        this.setPagination(respone.message);
        // 處理項次
        for (let stock of this.stocks) {
          this.page.seq++;
          stock.seq = this.page.seq;
        }
      });
    },
    onChang(val) {
      const diff = moment(val[1]).diff(val[0], "days");
      if (diff > 60) {
        this.warning("日期查詢間隔勿超過60天");
        val[0] = this.addDay(-60);
        val[1] = this.addDay(0);
      }
    },
    async onSortChange(val) {
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
  },
};
</script>
