import moment from "moment";
import { MessageBox, Message } from "element-ui";
import dateMixin from "@/utils/mixin/date";
import responeMixin from "@/utils/mixin/respone";
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
      client: {},
      connection: {
        protocol: "tcp",
        host: "210.242.68.168",
        port: 1883,
        endpoint: "",
        clean: true,
        connectTimeout: 30 * 1000, // ms
        reconnectPeriod: 4000, // ms
        clientId: "itri_" + Math.random().toString(16).substring(2, 8),
        username: "",
        password: "",
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
        //console.log(query);
        return query;
      };
    },
    userInfo() {
      return function () {
        return getUserInfo();
      };
    },
    /**
     * ????????????
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
     * ????????????
     */
    isReadOnly() {
      return function () {
        const user = getUserInfo();

        // ???????????????
        if (user == null) {
          return true;
        }
        // ????????????:???
        if (this.currentModelId() == 0 && user.workStation == null) {
          return true;
        }
        return user.workStation == null ? true : false;
      };
    },
    /**
     * ??????????????????
     * @returns
     */
    currentModelId() {
      return function () {
        return this.$store.state.settings.currentModel.id;
      };
    },
    currentModel() {
      return function () {
        return this.$store.state.settings.currentModel;
      };
    },
  },
  methods: {
    /**
     * ????????????
     * @param {*} val
     */
    setPagination(val) {
      this.page.number = val.number + 1;
      this.page.size = val.size;
      this.page.totalElements = val.totalElements;

      const pageable = val.pageable;
      this.page.seq = pageable.pageNumber * val.size;

      this.params.page = 1;
    },
    /**
     * ????????????
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
     * ????????????
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
     * ????????????
     * @param {*} msg
     * @param {*} showCancelButton
     * @returns
     */
    confirm(msg, showCancelButton = true) {
      return new Promise((resolve) => {
        this.$confirm(msg, "??????", {
          confirmButtonText: "??????",
          cancelButtonText: "??????",
          showCancelButton: showCancelButton,
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
     * ????????????
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
        this.warning("???????????????????????????60???");
      }
    },
    /**
     *
     * @param {*} carrierId
     */
    carrierCallback(carrierId) {
      let location = "";
      switch (this.workStation()) {
        case "STN101":
          location = "BCR111";
          break;
        case "STN102":
          location = "BCR121";
          break;
        case "STN103":
          location = "BCR131";
          break;
        case "STN104":
          location = "BCR141";
          break;
        case "STN201":
          location = "BCR211";
          break;
        case "STN202":
          location = "BCR221";
          break;
        case "STN203":
          location = "BCR231";
          break;
        case "STN204":
          location = "BCR241";
          break;
      }
      const data = {
        location: location,
        carrierNo: carrierId,
        callbackType: "locactionChanged",
      };
      carrierCallback(data).then((resp) => {
        console.log(resp);
      });
    },
    /**
     * ??????????????????
     * @param {*} path
     * @returns
     */
    async handleExecute(path) {
      // ??????????????? ????????????
      const execPath = await getWorkStationIsRun(this.workStation(), path);
      console.log(execPath);
      return execPath.length > 0;
    },
    carrierMap(bcr) {
      let mode = "";
      switch (this.workStation()) {
        case "STN101":
          mode = bcr == "BCR111" ? "IN" : "OUT";
          break;
        case "STN102":
          mode = bcr == "BCR121" ? "IN" : "OUT";
          break;
        case "STN102":
          mode = bcr == "BCR131" ? "IN" : "OUT";
          break;
        case "STN102":
          mode = bcr == "BCR141" ? "IN" : "OUT";
          break;
        case "STN201":
          mode = bcr == "BCR211" ? "IN" : "OUT";
          break;
        case "STN202":
          mode = bcr == "BCR221" ? "IN" : "OUT";
          break;
        case "STN203":
          mode = bcr == "BCR231" ? "IN" : "OUT";
          break;
        case "STN204":
          mode = bcr == "BCR241" ? "IN" : "OUT";
          break;
      }
      return mode;
    },
  },
  beforeDestroy() {
    //console.log("beforeDestroy");
  },
};
