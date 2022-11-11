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
      :data="content"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
    >
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column
        label="收單來源"
        prop="code"
        width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="入庫單號碼" prop="name" sortable="custom">
      </el-table-column>
      <el-table-column
        label="料品號"
        prop="statusName"
        width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="供應商"
        prop="statusName"
        width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="收料數量"
        prop="statusName"
        width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="入庫單狀態"
        prop="statusName"
        width="125"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="綁定站點"
        prop="statusName"
        width="125"
        sortable="custom"
      >
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getInbounds } from "@/api/inbound";
import { getWorkStation } from "@/api/workStation";
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
        page: 1,
        prodCode: "",
        properties: "",
        receivedEndDateTime: "",
        receivedStartDateTime: "",
        receiveSource: "",
        size: 50,
        sysOrderNo: "",
      },
      inStatus: [],
      inSource: [],
    };
  },
  async created() {
    this.nowDate.push(this.addDay(-7));
    this.nowDate.push(this.addDay(0));
    // 作業站點
    this.workStations = await this.getSelector(SelectTypeEnum.WORK_STATION);
    // 入庫單狀態
    this.inStatus = await this.getSelector(SelectTypeEnum.INBOUND_STATUS);
    // 收單來源
    this.inSource = await this.getSelector(SelectTypeEnum.INBOUND_SOURCE);
  },
  methods: {
    onLoad() {
      this.params.receivedStartDateTime = this.toDate(this.nowDate[0]);
      this.params.receivedEndDateTime = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params, false);
      getInbounds(query).then((respone) => {
        if (respone.message) {
          this.content = respone.message.content;
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
  },
};
</script>
<style></style>
