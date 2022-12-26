import mqtt from "mqtt";
import { getUserInfo } from "@/utils/localStorage";

export default {
  data() {
    return {
      mqtt_data: {},
    };
  },
  computed: {
    subscription() {
      const user = getUserInfo();
      return {
        topic: `${process.env.VUE_APP_MQTT_TOPIC_TAG}/${user.workStation}`,
        qos: 0,
      };
    },
  },
  methods: {
    connect() {
      try {
        // 連線
        this.client = mqtt.connect(process.env.VUE_APP_MQTT_ENTRY_POINT, {
          clean: true,
          defaultProtocol: "tcp",
          connectTimeout: 4000,
          reconnectPeriod: 1000,
          clientId: Math.random().toString(16).substring(2, 8),
          username: "",
          password: "",
        });

        const { topic, qos } = this.subscription;
        this.client.subscribe(topic, { qos }, (error, res) => {
          if (error) {
            console.log(`訂閱${topic}失敗`);
            console.log(error);
            return;
          }
          console.log("1.訂閱成功");
        });
      } catch (e) {
        console.log("mqtt.connect error", e);
      }
    },
  },
  beforeDestroy() {
    if (this.client) {
      this.client.end();
    }
  },
};
