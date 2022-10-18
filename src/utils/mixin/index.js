import { MessageBox, Message } from "element-ui";
import dateMixin from "@/utils/mixin/date";
import responeMixin from "@/utils/mixin/respone";
import example from "@/utils/mixin/exapmle.json";

export default {
  mixins: [dateMixin, responeMixin],
  data() {
    return {
      page: {
        page: 0,
        size: 50,
        totalPages: 0,
      },
    };
  },
  created() {
    if (process.env.NODE_ENV == "development") {
      //console.log(process.env.NODE_ENV);
    }
  },
  computed: {
    source() {
      return example;
    },
    getQuery() {
      return function (params) {
        let query = "";
        for (let [key, value] of Object.entries(params)) {
          if (typeof value == "number" && value == 0) {
            continue;
          }
          if (typeof value == "string" && value == "") {
            continue;
          }
          if (query == "") {
            query += `?${key}=${value}`;
          } else {
            query += `&${key}=${value}`;
          }
        }
        return query;
      };
    },
  },
  methods: {
    onSimulation() {},
    setPagination(val) {
      this.page.number = val.number + 1;
      this.page.size = val.size;
      this.page.totalPages = val.totalPages;
    },
    success(message, duration = 3000) {
      Message({
        message: message,
        type: "success",
        duration: duration,
      });
    },
    warning(message, duration = 3000) {
      Message({
        message: message,
        type: "warning",
        duration: duration,
      });
    },
    onNav(uri) {
      this.$router.push(uri);
    },
  },
};
