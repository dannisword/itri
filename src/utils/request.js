import axios from "axios";
import { MessageBox, Message } from "element-ui";
import { getUserInfo, getToken } from "./localStorage";

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000,
});
function parseBody(response) {
  if (response.status === 200) {
    return response.data;
  } else {
    return this.parseError(response.data.messages);
  }
}
function parseError(response) {
  if (response == undefined){
    Message({
      message: "服務停止！",
      type: "error",
      duration: 5000,
    });
    return;
  }
  if (response.status == 404 || response.status == 400) {
    Message({
      message: `錯誤的請求(${response.status})`,
      type: "warning",
      duration: 5000,
    });
    return;
    //return Promise.reject({ message: ["程式不存在"] });
  }
  if (response.status == 500) {
    Message({
      message: `服務發生問題(${response.status})`,
      type: "warning",
      duration: 5000,
    });
    return;
    //return Promise.reject({ message: ["程式發生問題"] });
  }
  // error
  if (response.data) {
    Message({
      message: response.data.message,
      type: "error",
      duration: 5 * 1000,
    });
  } else {
    return Promise.reject({ messages: ["發生了錯誤"] });
  }
}

// request interceptor
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token !== null) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => {
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    return parseBody(response);
  },
  (error) => {
    parseError(error.response);
    return Promise.reject(error);
  }
);

export default service;
