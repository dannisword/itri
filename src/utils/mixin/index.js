import moment from "moment";
import { MessageBox, Message } from "element-ui";
import dateMixin from "@/utils/mixin/date";
import responeMixin from "@/utils/mixin/respone";
//import example from "@/utils/mixin/exapmle.json";
import { getUserInfo } from "@/utils/localStorage";
import { getSelector } from "@/api/system";
import { carrierCallback } from "@/api/carrier";
import { getWorkStationIsRun } from "@/api/workStation";
import { SelectTypeEnum, RunModelEnum } from "@/utils/enums/index";

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
        showAction: true,
      },
      Medium: {
        size: "Medium",
        action: "",
        cancel: "",
        showAction: true,
      },
      Small: {
        size: "Small",
        action: "",
        cancel: "",
        showAction: true,
      },
    };
  },
  created() {
    if (process.env.NODE_ENV == "development") {
    }
  },
  computed: {
    env() {
      return process.env.NODE_ENV;
    },
    isDevelopment() {
      return process.env.NODE_ENV == "development";
    },
    mqtt_path() {
      return process.env.VUE_APP_MQTT_ENTRY_POINT;
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
            for (let item of value) {
              if (query == "") {
                query += `?${key}=${item}`;
              } else {
                query += `&${key}=${item}`;
              }
            }
          } else {
            if (query == "") {
              query += `?${key}=${value}`;
            } else {
              query += `&${key}=${value}`;
            }
          }
        }
        console.log(query);
        return query;
      };
    },
    userInfo() {
      return function () {
        return getUserInfo();
      };
    },
    /**
     * 站點資訊
     * @returns 
     */
    workStation() {
      return function () {
        const user = getUserInfo();
        if (user.workStation == null) {
          return "";
        }
        return user.workStation;
      };
    },
    /**
     * 唯讀模式
     */
    isReadOnly() {
      return function () {
        const user = getUserInfo();
        if (user == null){
          return true;
        }
        return user.workStation == null? true : false;
      };
    },
    /**
     * 作業模式
     * @returns 
     */
    currentModel() {
      return function () {
        return this.$store.state.settings.currentModel.id;
      };
    },
  },
  methods: {
    /**
     * 設定分頁
     * @param {*} val
     */
    setPagination(val) {
      this.page.number = val.number + 1;
      this.page.size = val.size;
      this.page.totalElements = val.totalElements;

      const pageable = val.pageable;
      this.page.seq = pageable.pageNumber * val.size;
    },
    /**
     * 成功訊息
     * @param {*} message
     * @param {*} duration
     */
    success(message, duration = 3000) {
      Message({
        message: message,
        type: "success",
        duration: duration,
      });
    },
    /**
     * 警告訊息
     * @param {*} message
     * @param {*} duration
     */
    warning(message, duration = 3000) {
      Message({
        message: message,
        type: "warning",
        duration: duration,
      });
    },
    /**
     * 提示訊息
     * @param {*} msg
     * @returns
     */
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
    /**
     * 導覽頁面
     * @param {*} uri
     */
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
    onDatePickeChang(val) {
      const diff = moment(val[1]).diff(val[0], "days");
      if (diff > 60) {
        val[0] = this.addDay(-7);
        val[1] = this.addDay(0);
        this.warning("日期查詢間隔勿超過60天");
      }
    },
    /**
     *
     * @param {*} carrierId
     */
    carrierCallback(carrierId) {
      const data = {
        location: "BCR111",
        carrierNo: carrierId,
        callbackType: "locactionChanged",
      };
      carrierCallback(data).then((resp) => {
        console.log(resp);
      });
    },
    /**
     * 換頁確認
     * @param {*} path
     * @returns
     */
    async handlePage(mode, path) {
      //
      const currentModal = this.$store.state.settings.currentModel;
      if (mode == RunModelEnum.Inbound) {
        console.log(mode);
      }
      // 是否切換到 作業模式
      const resp = await getWorkStationIsRun(this.workStation());
      if (resp.title == "successful") {
        console.log(resp);
      }
      return true;
    },
  },
  beforeDestroy() {
    //console.log("beforeDestroy");
  },
};
