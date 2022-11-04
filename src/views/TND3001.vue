<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="90px" :inline="true">
        <el-form-item label="收單日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="作業站點">
          <el-select
            v-model="params.assignWorkStationId"
            multiple
            placeholder="請選擇"
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

        <el-form-item label="出庫單狀態">
          <el-select v-model="params.docStatus" multiple placeholder="請選擇">
            <el-option
              v-for="item in outStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="出貨模式">
          <el-select v-model="params.docType" multiple placeholder="請選擇">
            <el-option
              v-for="item in outSource"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="出庫單號碼">
          <el-input v-model="params.sysOrderNo"></el-input>
        </el-form-item>

        <el-form-item label="料品號">
          <el-input v-model="params.prodCode"></el-input>
        </el-form-item>

        <el-divider class="form-divider"></el-divider>

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 分頁 -->
    <el-row type="flex">
      <el-col :span="8">
        <div type="flex">
          <el-button type="primary">執行批次生效</el-button>
          <el-button type="primary">自動叫單生效</el-button>
        </div>
      </el-col>
      <el-col :span="16" align="end">
        <el-pagination
          background
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
          :current-page="page.number"
          :page-size="page.size"
          layout="total,jumper,prev, pager, next"
          :total="page.totalElements"
        ></el-pagination>
      </el-col>
    </el-row>

    <!-- 資料-->
    <el-table
      :data="content"
      class="table-container"
      border
      stripe
      height="500"
    >
      <el-table-column type="selection" width="55"> </el-table-column>
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column
        label="出貨模式"
        prop="code"
        width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="出庫單號碼" prop="name" sortable="custom">
      </el-table-column>
      <el-table-column label="料品號" prop="statusName" sortable="custom">
      </el-table-column>
      <el-table-column
        label="供應商"
        prop="statusName"
        sortable="custom"
        width="100"
      >
      </el-table-column>
      <el-table-column
        label="數量"
        prop="statusName"
        sortable="custom"
        width="100"
      >
      </el-table-column>
      <el-table-column
        label="出庫單狀態"
        prop="statusName"
        sortable="custom"
        width="100"
      >
      </el-table-column>
      <el-table-column
        label="綁定站點"
        prop="statusName"
        sortable="custom"
        width="100"
      >
      </el-table-column>
      <el-table-column label="動作" width="200" align="center">
        <template slot-scope="scope">
          <el-button @click="onAction(scope.row)" size="mini" type="primary"
            >生效
          </el-button>
          <el-button @click="onAction(scope.row)" size="mini">失效 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getWorkStation } from "@/api/workStation";
import { getOutBounds } from "@/api/outbound";
import { SelectTypeEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      content: [],
      workStations: [],
      nowDate: [],
      params: {
        assignWorkStationId: "",
        direction: "ASC",
        docStatus: 0,
        docType: "0",
        page: 0,
        prodCode: "",
        properties: "id",
        receivedEndDateTime: "",
        receivedStartDateTime: "",
        size: 50,
        sysOrderNo: "",
      },
      outStatus: [],
      outSource: [],
    };
  },
  async created() {
    this.nowDate.push(this.addDay(-7));
    this.nowDate.push(this.addDay(0));
    getWorkStation().then((resp) => {
      if (resp.message) {
        this.workStations = resp.message;
      }
    });

    this.outStatus = await this.getSelector(SelectTypeEnum.OUTBOUND_STATUS);

    this.outSource = await this.getSelector(SelectTypeEnum.SHIPPING_MODE);
  },
  methods: {
    onLoad() {
      //this.onNav("/TND3100");

      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);
      getOutBounds(query).then((respone) => {
        this.content = respone.message;
        console.log(respone);
      });
    },
    onAction(val) {},
    onSizeChange(val) {},
    onCurrentChange(val) {},
  },
};
</script>
