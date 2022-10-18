<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="100px" :inline="true">
        <el-form-item label="簽入日期">
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
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
          :current-page="page.number"
          :page-size="page.size"
          layout="total,jumper,prev, pager, next"
          :total="page.totalPages"
        ></el-pagination>
      </el-col>
    </el-row>

    <el-table
      :data="stocks"
      class="table-container"
      border
      stripe
      height="100%"
      @sort-change="onSortChange"
    >
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="料品號" width="100" prop="prodCode" fixed>
      </el-table-column>
      <el-table-column label="入庫時間" width="120" prop="entryDate" sortable>
      </el-table-column>
      <el-table-column label="供應商" prop="supplier"> </el-table-column>
      <el-table-column label="數量" prop="availableQty"> </el-table-column>
      <el-table-column label="儲位編號" width="150" prop="stationId">
      </el-table-column>
      <el-table-column label="物流箱編號" width="150" prop="carrierId">
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
        page: 0,
        size: 10,
        direction: "ASC",
        properties: "id",
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
      this.params.page = this.page.page;
      this.params.size = this.page.size;
      this.params.totalPages = this.page.totalPages;
      const query = this.getQuery(this.params);
      getStocks(query).then((respone) => {
        this.stocks = respone.message.content;
      });
    },
    onChang(val) {
      const diff = moment(val[1]).diff(val[0], "days");
      if (diff > 60) {
        this.warning("日期查詢間隔勿超過60天");
        this.nowDate.push(this.addDay(-60));
        this.nowDate.push(this.addDay(0));
      }
    },
    onSortChange(val) {
      if (val.order == null) {
        return;
      }
      this.params.direction = val.order == "ascending" ? "ASC" : "DESC";
      this.params.properties = val.prop;
      this.onLoad();
    },
    onSizeChange(val) {},
    onCurrentChange(val) {},
  },
};
</script>
