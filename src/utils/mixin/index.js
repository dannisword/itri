import { MessageBox, Message } from "element-ui";
import dateMixin from "@/utils/mixin/date";
import responeMixin from "@/utils/mixin/respone";
import example from "@/utils/mixin/exapmle.json";
import { getUserInfo } from "@/utils/localStorage";
import { getSelector } from "@/api/system";

export default {
  mixins: [dateMixin, responeMixin],
  data() {
    return {
      page: {
        page: 0,
        size: 50,
        totalElements: 0,
        seq: 0,
      },
      Large: {
        size: "Large",
        action: "",
        cancel: "",
        showAction: false,
      },
      Medium: {
        size: "Medium",
        action: "",
        cancel: "",
        showAction: false,
      },
      Small: {
        size: "Small",
        action: "",
        cancel: "",
        showAction: false,
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
      return function (params, num = true) {
        let query = "";
        for (let [key, value] of Object.entries(params)) {
          if (typeof value == "number" && value == 0 && num == true) {
            continue;
          }
          if (typeof value == "string" && value == "") {
            continue;
          }
          //
          if (Array.isArray(value) == true) {
            console.log(value);
          } else {
            if (query == "") {
              query += `?${key}=${value}`;
            } else {
              query += `&${key}=${value}`;
            }
          }
        }
        //console.log(query);
        return query;
      };
    },
    userInfo() {
      return function () {
        return getUserInfo();
      };
    },
  },
  methods: {
    onSimulation() {},
    setPagination(val) {
      this.page.number = val.number + 1;
      this.page.size = val.size;
      this.page.totalElements = val.totalElements;

      const pageable = val.pageable;
      this.page.seq = pageable.pageNumber * val.size;
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
    getIndex(pageable) {
      return pageable.offset * 50 + 1;
    },
    clone(obj) {
      var data = JSON.stringify(obj);
      return JSON.parse(data);
    },
    confirm(msg) {
      return new Promise((resolve) => {
        this.$confirm(msg, "提示", {
          confirmButtonText: "確認",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      });
    },
    getSelector(type) {
      return new Promise((resolve, reject) => {
        getSelector(type)
          .then((resp) => {
            if (resp.status == "OK") {
              resolve(resp.message);
            }
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
  },
};
