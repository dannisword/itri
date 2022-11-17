<template>
  <div class="app-container">
    <el-form :model="params" label-width="90px" :inline="true">
      <el-form-item label="入庫單狀態">
        <el-input v-model="params.sysOrderNo"></el-input>
      </el-form-item>
      <el-button type="primary" @click="onNav('/TND2001')">回列表</el-button>
      <el-button type="success" @click="onNav('/TND2001')"
        >結束此單作業</el-button
      >
    </el-form>

    <div v-for="fit in fits" :key="fit">
      <el-image
        class="floated_box"
        style="width: 100px; height: 100px"
        :src="url"
        :fit="fit"
      ></el-image>
    </div>

    <el-table
      :data="content"
      class="table-container"
      style="height: 100px"
      border
    >
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="入庫單號碼" prop="name"> </el-table-column>
      <el-table-column label="料品號" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="供應商" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="收料數量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="實際已入庫總數" prop="statusName" width="125">
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
      <el-table-column label="磅秤重量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="磅秤預估數量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="實際已入庫總數" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="輸入已入數量" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="帳差" prop="statusName" width="125">
      </el-table-column>
      <el-table-column label="動作" prop="statusName" width="125">
        <template slot-scope="scope">
          <div>
            <el-button @click="onSetRole(scope.row)" size="mini" type="primary"
              >放置完成，送回
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
// 執行入庫工作
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getInBoundDetail } from "@/api/inbound";

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
      fits: ["fill", "fill", "fill", "fill", "fill"],
      url: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
    };
  },
  created() {
    console.log(this.$route.params.id);
    //
    this.onLoad();
  },
  methods: {
    onLoad() {
      getInBoundDetail(this.$route.params.id).then((resp) => {
        console.log(resp);
      });
    },
  },
};
</script>
<style>
.floated_box {
  float: left;
  margin: 10px;
}
</style>
