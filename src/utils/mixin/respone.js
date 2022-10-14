import { MessageBox, Message } from "element-ui";
/**
 * 處理 API 回傳訊息
 */
export default {
  computed: {
    /**
     *
     * @returns
     */
    getUser() {
      return (token) => {
        var base64Payload = token.split(".")[1];
        var payloadBuffer = Buffer.from(base64Payload, "base64");
        return JSON.parse(payloadBuffer.toString());
      };
    },
  },
  methods: {
    parseMessage(resp) {
      return new Promise((resolve) => {
        if (resp.status == "OK") {
          resolve(resp.message);
        } else {
          Message({
            message: "API 異常",
            type: "error",
            duration: 5000,
          });
          resolve(undefined);
        }
      });
    },
  },
};
