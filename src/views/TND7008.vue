<template>
  <div class="app-container">
    <div class="form-container">
      <el-form ref="params" :model="params" label-width="80px" :inline="true">
        <el-form-item label="建立日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      nowDate: [],
      params: {
        direction: "ASC",
        page: 1,
        properties: "id",
        size: 10,
      },
    };
  },
  created() {},
  methods: {},
};
</script>
<style scoped>
.el-date-editor--daterange.el-input, .el-date-editor--daterange.el-input__inner {
  width: 360px;
}
</style>
