<template>
    <div class="app-container">
      <div class="form-container">
        <el-form ref="form" :model="form" label-width="80px" :inline="true">
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
  
      };
    },
    created() {},
    methods: {},
  };
  </script>
  