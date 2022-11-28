<template>
  <div class="mainWrap">
    <div id="registerWrap">
      <el-form
        ref="loginForm"
        auto-complete="on"
        label-position="left"
        :model="user"
        :rules="loginRules"
      >
        <div id="register_header"><h1>倉儲管理系統</h1></div>

        <el-form-item prop="account">
          <el-input
            ref="account"
            name="account"
            v-model="user.account"
            placeholder="帳號"
            type="text"
            tabindex="1"
            auto-complete="on"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            ref="password"
            name="password"
            v-model="user.password"
            :type="passwordType"
            :key="passwordType"
            prefix-icon="el-icon-lock"
            placeholder="密碼"
            tabindex="2"
            auto-complete="on"
            @keyup.enter.native="handleLogin"
          >
            <template slot="append">
              <span class="show-pwd" @click="showPwd">
                <svg-icon
                  :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                />
              </span>
            </template>
          </el-input>
        </el-form-item>

        <el-button
          :loading="loading"
          type="info"
          style="width: 100%; margin-bottom: 30px"
          @click.native.prevent="onLogin()"
        >
          登入
        </el-button>
        <div class="tips">
          <span class="version-span">版本 v1.0.0:2205</span>
        </div>
      </el-form>
    </div>
    <div id="logo">
      <img src="../assets/logo-itri.png" alt="logo" class="logo" />
      <p>Copyright 工業技術研究院 All Rights Reserved.</p>
    </div>
  </div>
</template>

<script>
import { validEmpty } from "@/utils/validate";
import { _login } from "@/api/auth";

export default {
  name: "Login",
  data() {
    const validateUsername = (rule, value, callback) => {
      if (validEmpty(value) == true) {
        callback(new Error("請輸入帳號"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (validEmpty(value) == true) {
        callback(new Error("請輸入密碼"));
      } else {
        callback();
      }
    };
    return {
      user: {
        account: "",
        password: "",
      },
      loginRules: {
        account: [
          { required: true, trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
      note: {
        backgroundImage: "url(" + require("@/assets/bg_main_1.png") + ")",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      },
    };
  },
  created() {},
  watch: {
    $route: {
      handler(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    onLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid === false) {
          return;
        }
        this.loading = true;
        this.$store
          .dispatch("user/onLogin", this.user)
          .then((resp) => {
            if (resp == true) {
              this.$alert("首次登入請變更密碼！", "提示", {
                confirmButtonText: "確認",
                cancelButtonText: "取消",
                type: "warning",
              });
            }
            this.$router.push({ path: this.redirect || "/" });
            this.loading = false;
          })
          .catch((e) => {
            this.loading = false;
          });
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.user)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
  },
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;
/*
@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
*/
.version-span {
  color: #454545;
}
// 容器
/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}

.mainWrap {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url(../assets/bg_main_1.png), url(../assets/bg_main_2.png),
    url(../assets/bg_circle_1.svg), url(../assets/bg_circle_2.svg);
  background-position: right top, left bottom, left 100px top 190px,
    right 20% bottom 180px;
  background-repeat: no-repeat;
  background-size: 60%, 60%, 140px 130px, 130px 130px;
  margin: 0;
}

#registerWrap {
  position: absolute;
  width: 400px;
  background-color: #fff;
  box-shadow: 0px 0px 10px 10px #ccc;
  top: 23%;
  left: 20%;
  padding: 50px 40px;
  border-radius: 20px;
  z-index: 99999;
}

#register_header {
  background-size: 70px;
  width: 300px;
  top: 12%;
  left: 7%;
  margin-bottom: 30px;
}

#logo {
  position: absolute;
  bottom: 20px;
  right: 64px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

#logo img {
  width: 300px;
}

#logo p {
  color: #334750;
  font-size: 16px;
  line-height: 40px;
}
.el-button-login {
  background-color: #454545;
}
@media screen and (min-width: 1440px) {
  #mainWrap {
    background-image: url(../assets/bg_main_1.png), url(../assets/bg_main_2.png),
      url(../assets/bg_circle_1.svg), url(../assets/bg_circle_2.svg);
    background-position: right top, left bottom, left 100px top 190px,
      right 470px bottom 180px;
    background-repeat: no-repeat;
    background-size: 60%, 60%, 140px 130px, 130px 130px;
    margin: 0;
  }

  #registerWrap {
    top: 300px;
    left: 480px;
    background-color: #fff;
  }
}
</style>
