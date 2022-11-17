<template>
  <div>
    <el-dialog
      :title="optional.title"
      :visible.sync="optional.visible"
      :before-close="handleClose"
      :width="width"
    >
      <p><slot></slot></p>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="afterClosed(false)"
          v-if="optional.showAction == true"
          >{{ optional.cancel }}</el-button
        >
        <el-button
          type="primary"
          @click="afterClosed(true)"
          v-if="optional.showAction == true"
          >{{ optional.action }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "ModalDialog",
  props: {
    optional: {
      type: Object,
      default: () => ({
        title: "提示",
        name:"",
        visible:false,
        size: "Small",
        action: "確認",
        cancel: "取消",
        showAction: true,
      }),
    },
  },
  data() {
    return {
      width: "50%",
      dialogRef: {
        name: "",
        success: false,
        message: "",
        data: null,
      },
      formLabelWidth: "50px",
      dialogWidth: "350px",
    };
  },
  created() {
    this.dialogRef.name = this.optional.name;
    if (this.optional.size == "Small") {
      this.width = "30%";
    }
    if (this.optional.size == "Medium") {
      this.width = "50%";
    }
    if (this.optional.size == "Large") {
      this.width = "90%";
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        //this.setDialogWidth();
      })();
    };
  },
  methods: {
    setDialogWidth() {
      let windowSize = window.innerWidth;
      const defaultWidth = 1024; // 預設寬度
      if (windowSize <= defaultWidth) {
        this.width = defaultWidth + "px";
      } else {
        this.width = defaultWidth + "px";
      }
    },
    afterClosed(visible) {
      this.dialogRef.success = visible;
      this.$emit("afterClosed", this.dialogRef);
    },
    handleClose(done) {
      this.dialogRef.success = undefined;
      this.$emit("afterClosed", this.dialogRef);
    },
  },
};
</script>
<style>
@media screen and (max-width: 780px) {
  .el-dialog {
    min-width: 380px !important;
  }
}
</style>
