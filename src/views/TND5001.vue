<template>
  <div class="app-container">
    <div class="form-container">
      <!-- 查詢條件 -->
      <el-form :model="params" label-width="100px" :inline="true">
        <el-form-item label="盤點日期">
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

        <el-form-item label="盤點單狀態">
          <el-select v-model="params.docStatus" multiple placeholder="請選擇">
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="盤點類型">
          <el-select v-model="params.docType" multiple placeholder="請選擇">
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="盤點單號碼">
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
          <el-button type="primary">新增盤點單</el-button>
        </div>
      </el-col>
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

    <!-- 資料-->
    <el-table
      :data="content"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
    >
      <el-table-column
        label="項次"
        width="100"
        prop="seq"
        sortable="custom"
        fixed
      >
      </el-table-column>
      <el-table-column
        label="盤點單號碼"
        prop="sysOrderNo"
        width="130"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="單據狀態"
        prop="docStatusLabel"
        width="130"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="盤點類型"
        prop="type"
        width="130"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="盤點時間"
        prop="inventoryDate"
        width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="料品號"
        prop="prodCode"
        min-width="180"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="有複盤單"
        prop="hasChild"
        width="130"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.hasChild | formatEmpty }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="有異動單"
        prop="hasAdjust"
        width="130"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.hasAdjust | formatEmpty }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="綁定站點"
        prop="assignWorkStationId"
        width="130"
        sortable="custom"
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
import { getInventories } from "@/api/inventory";
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
        direction: "ASC",
        docNo: "",
        docStatus: 0,
        endDate: "",
        page: 1,
        prodCode: "",
        properties: "",
        size: 50,
        startDate: "",
        type: 0,
      },
      status: [],
      types: [],
    };
  },
  created() {
    this.nowDate.push(this.addDay(-7));
    this.nowDate.push(this.addDay(0));
    getWorkStation().then((resp) => {
      if (resp.message) {
        this.workStations = resp.message;
      }
    });
    this.getSelector(SelectTypeEnum.INVENTORY_STATUS).then((resp) => {
      this.status = resp;
    });
    this.getSelector(SelectTypeEnum.INVENTORY_TYPE).then((resp) => {
      this.types = resp;
    });
  },
  methods: {
    onLoad() {
      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);

      getInventories(query).then((respone) => {
        if (respone.status == "OK") {
          this.content = respone.message.content;
          console.log(respone);
          // 分頁設定
          this.setPagination(respone.message);
          // 處理項次
          for (let item of this.content) {
            this.page.seq++;
            item.seq = this.page.seq;
          }
        }
      });
    },
    onAction(val) {},
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
  },
};
</script>
