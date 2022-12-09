import defaultSettings from "@/settings";

const { showSettings, fixedHeader, sidebarLogo } = defaultSettings;

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  currentModel: {}
};

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value;
    }
  },
  // 工作模式切換
  CHANGE_MODEL: (state, value) => {
    state.currentModel = value;
  },
};

const actions = {
  changeSetting({ commit }, data) {
    commit("CHANGE_SETTING", data);
  },
  changeModel({ commit }, data) {
    commit("CHANGE_MODEL", data);
  },
  getCurrentModel({commit}, state){
    return "12"
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
