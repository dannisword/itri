<template>
  <div class="navbar">
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb class="breadcrumb-container" />
    <!-- 站點管理 -->
    <div class="right-menu" v-if="readOnly == false">
      站別：
      <span style="margin-right: 10px">{{ user.workStation }}</span>
      作業模式：
      <el-select
        v-model="workModel"
        placeholder="請選擇"
        style="margin-right: 10px"
        @change="onChange(workModel)"
      >
        <el-option
          class="zh-input"
          v-for="item in operating"
          :key="item.id"
          :label="item.label"
          :value="item"
        >
        </el-option>
      </el-select>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          {{ this.$store.state.user.name }}
          <i class="el-icon-caret-bottom"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item @click.native="logout">
            <span style="display: block">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 非站點管理 -->
    <div class="right-menu" v-else>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          {{ this.$store.state.user.name }}
          <i class="el-icon-caret-bottom"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item @click.native="logout">
            <span style="display: block">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import {
  getUserInfo,
  getStorageItem,
  setStorageItem,
  clearStorageItem,
} from "@/utils/localStorage";
import { logout } from "@/api/auth";
import { getSelector } from "@/api/system";
import { SelectTypeEnum } from "@/utils/enums/index";
import { changeWorkStation, getWorkStation } from "@/api/workStation";

export default {
  components: {
    Breadcrumb,
    Hamburger,
  },
  computed: {
    ...mapGetters(["sidebar", "avatar"]),
  },
  data() {
    return {
      user: {},
      operating: [],
      readOnly: true,
      workModel: {
        id: 0,
        value: "無",
        label: "無",
      },
    };
  },
  async created() {
    this.$store.dispatch("user/getInfo").then((data) => {
      this.user = data;
      this.readOnly = this.user.workStation == null ? true : false;
    });
    // 工作模式下拉選單
    let resp = await getSelector(SelectTypeEnum.OPERATING_MODE);
    if (resp.title == "successful") {
      this.operating = resp.message;
    }
    // 預設作業模式
    resp = await getWorkStation(this.user.workStation);
    if (resp.title == "successful") {
      const ws = this.operating.find(
        (x) => x.value == resp.message.currentModel
      );
      if (ws != undefined) {
        this.$store.dispatch("settings/changeModel", ws);
        this.workModel = ws;
      } else {
        this.workModel = this.operating[0];
      }
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await logout();
      clearStorageItem();
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    },
    async onChange(val) {
      // 檢查作業模式
      const resp = await getWorkStation(this.user.workStation);
      if (resp.title == "successful") {
        if (resp.message.currentModel == val.value) {
          return;
        }
      }
    /**
     
       const ws = this.operating.find(
            (x) => x.value == resp.message.currentModel
          );
          this.workModel = ws;
          this.warning(`請先完成${resp.message.currentModel}`);
     */
      changeWorkStation(val.value).then((resp) => {
        if (resp.title == "successful") {
          setStorageItem("currentModel", val);
          this.$store.dispatch("settings/changeModel", val);
        } else {
          if (resp.message) {
            this.warning(resp.message);
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(90deg, #6868fd, #75ebfd);
  box-shadow: 0 1px 4px rgba(15, 67, 116, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 0px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.el-select .el-input_i {
  font-size: 10px;
}

.documentation-container {
  margin: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  .document-btn {
    flex-shrink: 0;
    display: block;
    cursor: pointer;
    background: black;
    color: white;
    height: 60px;
    padding: 0 16px;
    margin: 16px;
    line-height: 60px;
    font-size: 20px;
    text-align: center;
  }
}
</style>
