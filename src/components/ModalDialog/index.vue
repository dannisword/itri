<template>
  <div @click="onClick">
    <el-dialog
      :title="title"
      :visible.sync="visible"
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
    title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },
    optional: {
      type: Object,
      default: () => ({
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
      counter: 1,
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
    this.dialogRef.name = this.name;
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
    onClick() {
      this.counter += 1;
      if (this.counter > 5) {
        this.counter = 0;
        this.$emit("onExecute");
      }

    },
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
