<template>
  <div class="app-container">
    <el-form label-width="100px" :inline="false">
      <el-form-item label="帳號">
        <el-input v-model="user.account" disabled></el-input>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="user.userName"></el-input>
      </el-form-item>
      <el-form-item label="角色名稱">
        <el-select v-model="userRoles" multiple placeholder="請選擇" disabled>
          <el-option
            v-for="item in roles"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          >
            <span style="float: left">{{ item.label }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSave()">存檔</el-button>
        <el-button @click="onLoad()">取消</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="success" @click="dialogs.PWD.visible = true"
          >變更密碼</el-button
        >
      </el-form-item>
    </el-form>

    <ModalDialog
      :title="dialogs.PWD.title"
      :name="dialogs.PWD.name"
      :visible.sync="dialogs.PWD.visible"
      @afterClosed="onModalClose"
    >
      <el-form label-width="120px" :inline="false">
        <el-form-item label="輸入舊密碼">
          <el-input type="password" v-model="password.original"></el-input>
        </el-form-item>
        <el-form-item label="輸入新密碼">
          <el-input type="password" v-model="password.new"></el-input>
        </el-form-item>
        <el-form-item label="再次輸入新密碼">
          <el-input type="password" v-model="password.confirm"></el-input>
        </el-form-item>
      </el-form>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getUser, setUser, changPassword } from "@/api/user";
import { getSelector } from "@/api/system";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      user: {},
      roles: [],
      userRoles: [],
      password: {
        original: "",
        new: "",
        confirm: "",
      },
      dialogs: {
        PWD: {
          title: "修改密碼",
          name: "PWD",
          visible: false,
        },
      },
    };
  },
  created() {
    getSelector("USER_ROLE").then((resp) => {
      if (resp.status == "OK") {
        this.roles = resp.message;
      }
    });
    this.onLoad();
  },
  methods: {
    onLoad() {
      var data = this.userInfo();

      getUser(data.id).then((resp) => {
        this.userRoles = [];
        if (resp.status == "OK") {
          this.user = resp.message;

          this.user.roles.forEach((element) => {
            this.userRoles.push(element.id);
          });
        }
      });
    },
    onSave() {
      const roles = [];
      this.userRoles.forEach((e) => {
        roles.push({ id: e });
      });
      this.user.roles = roles;
      setUser(this.user.id, this.user).then((resp) => {
        if (resp.status == "OK") {
          this.user = resp.message;
          this.success("資料異動成功");
        }
      });
    },
    onModalClose(val) {
      if (val.success == undefined || val.success == false) {
        this.dialogs.PWD.visible = false;
        return;
      }
      if (val.success == true) {
        if (
          this.password.confirm.length <= 0 &&
          this.password.new.length <= 0
        ) {
          this.warning("新密碼不一致，請重新輸入！");
          return;
        }
        if (this.password.new !== this.password.confirm) {
          this.warning("新密碼不一致，請重新輸入！");
          return;
        }
        changPassword(
          this.user.id,
          this.password.original,
          this.password.new
        ).then((res) => {
          if (res.status == "OK") {
            this.dialogs.PWD.visible = false;
            this.success("已完成變更密碼！");
            this.password.original = "";
            this.password.new = "";
            this.password.confirm = "";
          }
        });
      }
    },
  },
};
</script>

<style scoped>
.el-input {
  width: auto;
}
.el-select {
  width: 180px;
}
</style>
