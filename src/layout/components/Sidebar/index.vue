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
import { getWorkStation, getWorkStationIsRun } from "@/api/workStation";
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
      // 限制選單
      console.log(menu);
      const rootName = this.getRootName(menu.index);
      console.log(rootName);
      if (rootName == "") {
        this.$router.push(menu.path);
        return;
      }
     
      const user = getUserInfo();
      // 作業模式 限制
      const resp = await getWorkStation(user.workStation);
      let currentModel = "";
      if (resp.title == "successful") {
        currentModel = resp.message.currentModel;
        if (resp.message.currentModel != rootName) {
          this.showMsg("請先切換右上角作業模式，才可進入畫面1");
          return;
        }
      }

      if (currentModel != rootName) {
        this.showMsg("請先切換右上角作業模式，才可進入畫面1");
        return;
      }
      // 檢查權限
      if (user.workStation != null) {
        const executePage = await getWorkStationIsRun(
          user.workStation,
          menu.index
        );
        console.log(executePage.length);
        if (
          executePage.length > 0 &&
          executePage != menu.index &&
          this.getControlPage(menu.index)
        ) {
          this.showMsg("請先切換右上角作業模式，才可進入畫面");
          return;
        }
      }
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
