<template>
  <div class="app-container">
    <el-form :model="params" label-width="90px" :inline="true">
      <el-form-item label="出庫單狀態">
        <el-input v-model="params.sysOrderNo"></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND3001')">回列表</el-button>
      <el-button type="success" @click="onNav('/TND3001')"
        >結束此單作業</el-button
      >
    </el-form>
    <el-button type="primary">補料</el-button>
    <el-table
      :data="content"
      class="table-container"
      style="height: 100px"
      border
    >
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="出庫單號碼" prop="name"> </el-table-column>
      <el-table-column label="料品號" prop="statusName"> </el-table-column>
      <el-table-column label="供應商" prop="statusName"> </el-table-column>
      <el-table-column label="訂購數量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="實際已揀總數" prop="statusName" width="125">
      </el-table-column>
    </el-table>
    <el-form :model="params" label-width="180px" :inline="true">
      <el-form-item label="請刷讀物流箱編號條碼">
        <el-input v-model="params.sysOrderNo"></el-input>
      </el-form-item>
    </el-form>
    <el-table :data="content" class="table-container" border>
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="物流箱編號" prop="name"> </el-table-column>
      <el-table-column label="物流箱內數量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="已揀數量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="輸入已揀數量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="帳差" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="動作" prop="statusName" width="125">
        <template slot-scope="scope">
          <div>
            <el-button @click="onAction(scope.row)" size="mini" type="primary"
              >取下
            </el-button>
            <el-button @click="onAction(scope.row)" size="mini" type="primary"
              >放置完成，送回
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getSelector, enumInfo } from "@/api/system";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      params: {
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
    };
  },
  created() {

  },
  methods: {
    onAction(val) {},
  },
};
</script>
