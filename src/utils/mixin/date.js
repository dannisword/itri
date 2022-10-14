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
    endOfMonth: function (format = "YYYY-MM-DD") {
      return moment().endOf("month").format(format);
    },
    toDate: function (nip, format = "YYYY-MM-DD") {
      return getDateTime(nip, format);
    },
    toDateTime: function (nip, format = "YYYY-MM-DD HH:mm:ss") {
      return getDateTime(nip, format);
    },
    toShortDate: function (format = "YYYY-MM-DD") {
      return getDateTime(nip, format);
    },
    toShortTime: function (format = "HH:mm") {
      return getDateTime(nip, format);
    },
  },
};
