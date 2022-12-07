//import { login, logout, getInfo } from '@/api/user'
import { login } from "@/api/auth";
import {
  getUserInfo,
  setUserInfo,
  clearStorageItem,
  setStorageItem,
} from "@/utils/localStorage";

import { resetRouter } from "@/router";
import { MessageBox, Message } from "element-ui";

const getDefaultState = () => {
  return {
    token: "",
    name: "",
    avatar: "",
  };
};

const getUserData = (token) => {
  try {
    var base64Payload = token.split(".")[1];
    var payloadBuffer = Buffer.from(base64Payload, "base64");
    return JSON.parse(payloadBuffer.toString());
  } catch {
    return undefined;
  }
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
};

const actions = {
  // user login
  onLogin({ commit }, userInfo) {
    const { account, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ account: account.trim(), password: password })
        .then((response) => {
          if (response.status != "OK") {
            resolve(false);
            Message({
              message: response.errorMessage,
              type: "warning",
              duration: 3000,
            });
            return;
          }
          var data = getUserData(response.message.token);
          const isFirst = account == password ? true : false;
          if (data) {
            setUserInfo(data);
            setStorageItem("accessToken", response);
            commit("SET_NAME", data.userName);
            commit("SET_TOKEN", response.message.token);
          }
          resolve(isFirst);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      var data = getUserInfo();
      if (data == null) {
        reject(undefined);
      } else {
        commit("SET_NAME", data.userName);
        resolve(data);
      }
    });
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken(); // must remove  token  first
          resetRouter();
          commit("RESET_STATE");
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken(); // must remove  token  first
      commit("RESET_STATE");
      resolve();
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
