<template>
  <div :class="{ 'has-logo': showLogo }">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
        @select="handleSelect"
      >
        <div v-for="menu in menus">
          <el-menu-item
            v-if="menu.hasChilds == false"
            @click="onNav(menu)"
            :index="menu.index"
            class="submenu-title-noDropdown"
          >
            <i :class="menu.icon"></i>
            <span slot="title">{{ menu.name }}</span>
          </el-menu-item>
          <!-- 有子目錄 -->
          <el-submenu v-else :index="menu.index">
            <template slot="title">
              <i :class="menu.icon"></i>
              <span slot="title">{{ menu.name }}</span>
            </template>

            <el-menu-item
              :index="sub.index"
              v-for="sub in menu.subs"
              @click="onNav(sub)"
            >
              <span slot="title">{{ sub.name }}</span>
            </el-menu-item>
          </el-submenu>
        </div>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "./Logo";
import { Message } from "element-ui";
import variables from "@/styles/variables.scss";
import { getUserMenus } from "@/api/user";
import {
  getWorkStation,
  getWorkStationIsRun,
  changeWorkStation,
} from "@/api/workStation";

import { getTodaySignIn } from "@/api/station";

import { getUserInfo, getStorageItem } from "@/utils/localStorage";

export default {
  components: { Logo },
  data() {
    return {
      menus: [],
    };
  },
  created() {
    this.onLoad();
  },
  computed: {
    ...mapGetters(["sidebar"]),
    routes() {
      return this.$router.options.routes;
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
  },
  methods: {
    async onLoad() {
      //this.menus = await getMenus();
      const data = await getUserMenus();

      const menus = data.message;
      let id = 1;
      for (let menu of menus) {
        menu.icon = this.getIcon(menu.index);
        menu.path = `/${menu.index}`;
        id++;
        if (menu.hasChilds == false) {
          continue;
        }
        for (let sub of menu.subs) {
          sub.path = `/${sub.index}`;
          id++;
        }
      }
      this.menus = menus;
    },
    handleSelect(key, keyPath) {},
    async onNav(menu) {
      const user = getUserInfo();
      // 作業模式限制
      if (user.workStation == null) {
        this.$router.push(menu.path);
        return;
      }
      // 檢查當日有簽入紀錄
      const signins = await getTodaySignIn();
      let isSignin = false;
      if (signins.title == "successful") {
        isSignin = signins.message.length > 0;
      }
      //this.showMsg(`請先簽入站點人員，才可開始執行工作！`);
      //console.log(`1.作業站點 ${user.workStation}！`);
      // 切換作業模式
      const executePage = await getWorkStationIsRun(
        user.workStation,
        menu.index
      );
      const model = this.getCurrentModel(executePage);
      const selectedModel = this.getCurrentModel(menu.index);
      //console.log(`2.未執行完成功能，${model.value}-${executePage} 功能！`);
      //console.log(`3.使用者點選，${selectedModel.value}-${menu.index} 功能！`);
      if (isSignin == false && selectedModel.value == "無") {
        this.$store.dispatch("settings/changeModel", selectedModel);
        this.$router.push(menu.path);
        return;
      }
      if (isSignin == false && selectedModel.value != "無") {
        this.showMsg(`請先簽入站點人員，才可開始執行工作！`);
        return;
      }
      // 狀態無
      if (selectedModel.value == "無") {
        this.$store.dispatch("settings/changeModel", selectedModel);
        this.$router.push(menu.path);
        return;
      }
      //this.$store.dispatch("settings/changeModel", selectedModel);
      // 未執行完工作
      if (model.value != selectedModel.value && model.id > 0) {
        this.showMsg(`${model.value}尚有，未執行完成工作`);
        return;
      }
      // 變更狀態
      changeWorkStation(selectedModel.value).then((resp) => {
        if (resp.title == "successful") {
          this.$store.dispatch("settings/changeModel", selectedModel);
        }
      });
      this.$router.push(menu.path);
    },
    showMsg(msg) {
      Message({
        message: msg,
        type: "warning",
        duration: 5000,
      });
    },
    getControlPage(path) {
      switch (path) {
        case "TND2001":
        case "TND3001":
        case "TND3002":
        case "TND4001":
        case "TND5001":
          return true;
        default:
          return false;
      }
    },
    getIcon(code) {
      switch (code) {
        case "TND1000":
          return "el-icon-user-solid";
        case "TND2000":
          return "el-icon-download";
        case "TND3000":
          return "el-icon-upload2";
        case "TND4000":
          return "el-icon-help";
        case "TND5000":
          return "el-icon-tickets";
        case "TND6000":
          return "el-icon-search";
        case "TND7000":
          return "el-icon-setting";
        default:
          return "";
      }
    },
    getCurrentModel(path) {
      let ws = {
        id: 0,
        label: "無",
        value: "無",
      };
      switch (path) {
        case "TND2001":
        case "TND2002":
          return {
            id: 1,
            label: "入庫作業",
            value: "入庫作業",
          };

        case "TND3001":
        case "TND3002":
          return {
            id: 2,
            label: "出庫作業",
            value: "出庫作業",
          };

        case "TND4001":
          return {
            id: 3,
            label: "加工作業",
            value: "加工作業",
          };

        case "TND5001":
          return {
            id: 4,
            label: "盤點作業",
            value: "盤點作業",
          };
        default:
          return {
            id: 0,
            label: "無",
            value: "無",
          };
      }
    },
    getRootName(path) {
      switch (path) {
        case "TND2001":
        case "TND2002":
          return "入庫作業";

        case "TND3001":
        case "TND3002":
          return "出庫作業";

        case "TND4001":
          return "加工作業";

        case "TND5001":
          return "盤點作業";

        default:
          return "";
      }
    },
    //
  },
};
</script>
