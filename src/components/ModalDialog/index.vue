<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="visible"
      :width="width"
      :before-close="handleClose"
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

      dialogRef: {
        name: "",
        success: false,
        message: "",
        data: null,
      },
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
  methods: {

    afterClosed(visible) {
      this.dialogRef.success = visible;
      this.$emit("afterClosed", this.dialogRef);
    },
    handleClose(done) {
      this.dialogRef.success = false;
      this.$emit("afterClosed", this.dialogRef);
    },
  },
};
</script>
<style>
.dialog {
  width: 50% !important;
  min-width: 200px !important;
}
</style>
