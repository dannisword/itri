<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="form" label-width="80px" :inline="true">
        <el-form-item label="簽入日期">
          <el-date-picker
            v-model="form.nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="站別">
          <el-select v-model="form.station" placeholder="請選擇">
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
          <el-button type="primary" @click="onSearch()">查詢</el-button>
          <el-button type="success" @click="onCheck('IN')"
            >執行今日簽入</el-button
          >
          <el-button type="warning" @click="onCheck('OUT')"
            >執行今日簽出</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div>
      <p>{{ this.form.date | formatDate("YYYY-MM-DD") }}</p>
    </div>

    <!-- dialog -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="80%"
    >
      <span>一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dateMixin from "@/utils/mixin/date";
import { getUser } from "@/api/user";

export default {
  mixins: [dateMixin],
  data() {
    return {
      dialogVisible: false,
      form: {
        nowDate: [],
        station: "",
        dt: "",
      }
    };
  },
  created() {
    this.form.nowDate.push(new Date());
    this.form.nowDate.push(new Date());
  },
  methods: {
    onSearch() {},
    onCheck(mode) {
      // 開窗
      this.dialogVisible = true;
    },
    handleClose(){

    }
  },
};
</script>
