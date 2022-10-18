<template>
  <div class="container note" :style="note">
    <div class="login-content">
      <el-form
        class="login-form"
        ref="loginForm"
        auto-complete="on"
        label-position="left"
        :model="loginForm"
        :rules="loginRules"
      >
        歡迎
        <div class="title-container">
          <h3 class="title">請先登入</h3>
        </div>

        <el-form-item prop="account">
          <el-input
            ref="account"
            name="account"
            v-model="loginForm.account"
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
            v-model="loginForm.password"
            :type="passwordType"
            :key="passwordType"
            prefix-icon="el-icon-lock"
            placeholder="Password"
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
          type="primary"
          style="width: 100%; margin-bottom: 30px"
          @click.native.prevent="onLogin()"
        >
          登入
        </el-button>
        <div class="tips">
          <span>version 2022-09-01</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";
import { _login, login } from "@/api/auth";

export default {
  name: "Login",
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error("請輸入帳號"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 0) {
        callback(new Error("請輸入密碼"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        account: "admin",
        password: "admin",
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
        backgroundImage: "url(" + require("@/assets/background.png") + ")",
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
          .dispatch("user/onLogin", this.loginForm)
          .then((resp) => {
            this.$router.push({ path: this.redirect || "/" });
            this.loading = false;
          })
          .catch((e) => {
            this.loading = false;
          });

        return;
        const resp = await login(
          this.loginForm.account,
          this.loginForm.password
        );
        const data = await this.parseMessage(resp);
        if (data !== undefined) {
          var userInfo = this.getUser(data.token);
          this.setUserInfo(userInfo);
          this.$router.push({ path: this.redirect || "/" });
        }
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
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
</style>
