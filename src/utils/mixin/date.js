import moment from "moment";
function getDateTime(inp, format) {
  if (inp) {
    return moment(inp).format(format);
  }
  return null;
}
/**
 * 處理日期及格式
 */
export default {
  filters: {
    formatDate(inp, format) {
      if (!inp) {
        return "";
      }
      if (format == null) {
        return moment(inp).format("YYYY-MM-DD HH:mm:ss");
      }
      return moment(inp).format(format);
    },
    formatEnable(isEnable) {
      if (isEnable == true) {
        return "啟用";
      } else {
        return "停用";
      }
    },
    formatEmpty(isEmpty){
      if (isEmpty == true) {
        return "是";
      } else {
        return "否";
      }
    },
    formatRoleName(data){
      let name = "";
      for (let role of data) {
        if (name == "") {
          name = role.name;
        } else {
          name += `, ${role.name}`;
        }
        role.isEnable = true;
      }
      return name;
    }
  },
  methods: {
    /**
     * 月初
     * @param {*} format
     * @returns
     */
    startOfMonth: function (format = "YYYY-MM-DD") {
      return moment().startOf("month").format(format);
    },
    /**
     *
     * @param {*} format
     * @returns
     */
    endOfMonth: function (format = "YYYY-MM-DD") {
      return moment().endOf("month").format(format);
    },
    /**
     *
     * @param {*} nip
     * @param {*} format
     * @returns
     */
    addDay: function (amount, format = "YYYY-MM-DD") {
      return moment().add(amount, "days").format(format);
    },
    toDate: function (nip, format = "YYYY-MM-DD") {
      return getDateTime(nip, format);
    },
    toDateTime: function (nip, format = "YYYY-MM-DD HH:mm:ss") {
      return getDateTime(nip, format);
    },
    toShortDate: function (format = "YYYY-MM-DD") {
      return getDateTime(new Date(), format);
    },
    toShortTime: function (format = "HH:mm") {
      return getDateTime(new Date(), format);
    },
  },
};
