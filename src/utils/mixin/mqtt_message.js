import mqtt from "mqtt";
import moment from "moment";
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
        qos: 1,
      };
    },
  },
  methods: {
    connect(mode) {
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
            console.log(`subscribe to topics failed`);
            console.log(error);
            return;
          }
          console.log(`[${mode} (${moment().format("YYYY-MM-DD hh:mm:ss")})] mqtt connect success`);
          console.log(`[${mode} (${moment().format("YYYY-MM-DD hh:mm:ss")})] topic: ${topic}, qos: ${qos}`);
        });
      } catch (e) {
        console.log("mqtt.connect error", e);
      }
    },
  },
};
