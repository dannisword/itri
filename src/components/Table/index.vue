<template>
  <el-table :data="data" v-loading="loading" style="width: 100%">
    <template v-for="column in columns">
      <el-table-column
        v-if="!column.component"
        :label="column.label"
        :prop="column.prop"
        :fixed="column.fixed"
      ></el-table-column>
      <el-table-column v-else :label="column.label">
        <template slot-scope="scope">
          <el-input v-model="scope.value"></el-input>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>
<script>
export default {
  name: "DefaultTable",
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
  render(h) {
    let self = this;
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    getAttrs(h, column) {
      const self = this;
      const scopedSlots =
        column.slot || column.render || column.component
          ? {
              scopedSlots: {
                default(scope) {
                  const exportVal = {
                    column: scope.column,
                    $index: scope.$index,
                    row: scope.row,
                  };
                  if (column.slot) {
                    return self.$scopedSlots[column.slot](exportVal);
                  } else if (column.render) {
                    return column.render(h, exportVal);
                  } else if (column.component) {
                    return h(column.component);
                  }
                },
              },
            }
          : {};

      return {
        ...scopedSlots,
        attrs: {
          ...column,
          "show-overflow-tooltip": true,
          align: column.align || "center",
        },
      };
    },
  },
};
</script>
