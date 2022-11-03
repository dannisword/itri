<template>
  <div class="app-container"></div>
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
      params: {
        page: 0,
        size: 50,
        direction: "ASC",
        properties: "id",
      },
    };
  },
  created() {},
  methods: {},
};
</script>
