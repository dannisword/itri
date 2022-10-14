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
            :index="menu.code"
            class="submenu-title-noDropdown"
          >
            <i :class="menu.icon"></i>
            <span slot="title">{{ menu.description }}</span>
          </el-menu-item>
          <!-- 有子目錄 -->
          <el-submenu v-else :index="menu.code">
            <template slot="title">
              <i :class="menu.icon"></i>
              <span slot="title">{{ menu.description }}</span>
            </template>

            <el-menu-item
              :index="sub.code"
              v-for="sub in menu.subs"
              @click="onNav(sub)"
            >
              <span slot="title">{{ sub.description }}</span>
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
import variables from "@/styles/variables.scss";
//import { getMenus } from "@/api/baseService.js";
import { getMenus } from "@/utils/app";

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
      this.menus = await getMenus(this.routes);
    },
    handleSelect(key, keyPath) {},
    onNav(menu) {
      // 檢查權限
      this.$router.push(menu.code);
    },
    //
  },
};
</script>
