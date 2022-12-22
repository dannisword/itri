<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form ref="params" :model="params" label-width="80px" :inline="true">
        <el-form-item label="帳號">
          <el-input v-model="params.account"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="params.userName"></el-input>
        </el-form-item>
        <el-form-item label="角色名稱">
          <el-select v-model="params.roleId" multiple placeholder="請選擇">
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="params.isEnable" multiple placeholder="請選擇">
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
          <el-button type="success" @click="onOpenModal(null)"
            >新增帳號</el-button
          >
        </el-form-item>
        <el-divider class="form-divider"></el-divider>
      </el-form>
    </div>
    <!-- 分頁底部 -->
    <el-row type="flex">
      <el-col :span="8"> </el-col>
      <el-col :span="16" align="end">
        <el-pagination
          background
          @current-change="onCurrentChange"
          :current-page="page.number"
          :page-size="page.size"
          layout="total,jumper,prev, pager, next"
          :total="page.totalElements"
        ></el-pagination>
      </el-col>
    </el-row>
    <!-- 資料 -->
    <el-table
      v-loading="loading"
      :data="users"
      class="table-container"
      border
      stripe
      @cell-dblclick="ondblClick"
      @sort-change="onSortcChange"
    >
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="帳號" prop="account" fixed sortable="custom">
      </el-table-column>
      <el-table-column
        label="姓名"
        prop="userName"
        width="120"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="角色名稱"
        prop="roles"
        width="200"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.roles | formatRoleName() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="狀態" prop="isEnable">
        <template slot-scope="scope">
          <span>{{ scope.row.isEnable | formatEnable() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="帳號啟用日" prop="enableDate" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.enableDate | formatDate("YYYY-MM-DD") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="帳號停用日" prop="disableDate" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.disableDate | formatDate("YYYY-MM-DD") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="編輯" width="200" align="center">
        <template slot-scope="scope">
          <el-button @click="onOpenModal(scope.row)" size="mini" type="primary"
            >編輯
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/編輯帳號 -->
    <ModalDialog
      :title="dialogs.account.title"
      :name="dialogs.account.name"
      :visible.sync="dialogs.account.visible"
      @afterClosed="onModalClose"
      :optional="Small"
    >
      <div>
        <el-form ref="user" :model="user" label-width="100px" :rules="rules">
          <el-form-item label="帳號" prop="account">
            <el-input v-model="user.account"></el-input>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="user.userName"></el-input>
          </el-form-item>
          <el-form-item label="角色名稱" prop="userRoles">
            <el-select v-model="userRoles" multiple placeholder="請選擇">
              <el-option
                v-for="item in roles"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="狀態">
            <el-select v-model="user.isEnable" placeholder="請選擇">
              <el-option
                v-for="item in status"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="啟用生效日">
            <el-date-picker
              type="date"
              v-model="user.enableDate"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="停用生效日">
            <el-date-picker
              type="date"
              v-model="user.disableDate"
            ></el-date-picker>
          </el-form-item>
          <el-form-item v-if="user.id > 0">
            <el-button type="success" @click="onChangPassword()">
              修改密碼
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </ModalDialog>

    <!-- 修改密碼 -->
    <ModalDialog
      :title="dialogs.password.title"
      :name="dialogs.password.name"
      :visible.sync="dialogs.password.visible"
      @afterClosed="onModalClose"
    >
      <el-form
        ref="password"
        :model="password"
        label-width="150px"
        :rules="rules"
      >
        <el-form-item label="輸入新密碼" prop="originalPassword">
          <el-input
            type="password"
            v-model="password.originalPassword"
          ></el-input>
        </el-form-item>
        <el-form-item label="再次輸入新密碼" prop="newPassword">
          <el-input type="password" v-model="password.newPassword"></el-input>
        </el-form-item>
      </el-form>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getUsers, setUser, addUser, changPassword } from "@/api/user";
import { SelectTypeEnum } from "@/utils/enums/index";
import { validLetters, validEmpty, validPassword } from "@/utils/validate";
import { getSelector } from "@/api/system";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    const validateAccount = (rule, value, callback) => {
      if (validEmpty(value) == true) {
        callback(new Error("請輸入帳號"));
      } else if (validLetters(value) == true) {
        callback(new Error("請輸入英數字"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (validPassword(value) == true) {
        callback(new Error("限英數字與特殊符號，不可有空白格!"));
      } else {
        callback();
      }
    };
    const validateUserRole = (rule, value, callback) => {
      console.log(value);
      callback();
      if (!value) {
        callback(new Error("角色名稱，不可有空白格!"));
      }
    };
    return {
      rules: {
        account: [
          { required: true, trigger: "blur", validator: validateAccount },
        ],
        originalPassword: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
        newPassword: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
        userRoles: [
          { required: true, trigger: "blur", validator: validateUserRole },
        ],
      },
      loading: false,
      params: {
        account: "",
        direction: "ASC",
        isEnable: [],
        page: 1,
        properties: "account",
        roleId: [],
        size: 50,
        userName: "",
      },
      user: {},
      users: [],
      roles: [],
      userRoles: [],
      status: [],
      password: {
        originalPassword: "",
        newPassword: "",
      },
      dialogs: {
        account: {
          title: "",
          name: "ACCOUNT",
          visible: false,
        },
        password: {
          title: "修改密碼",
          name: "PASSWORD",
          visible: false,
        },
      },
    };
  },
  async created() {
    getSelector(SelectTypeEnum.USER_ROLE).then((resp) => {
      if (resp.title == "successful") {
        this.roles = resp.message;
      }
    });
    // 狀態
    getSelector(SelectTypeEnum.ENABLED_TYPE).then((resp) => {
      if (resp.title == "successful") {
        this.status = resp.message;
      }
    });

    //this.status = this.source.status;
    await this.onLoad();
  },
  methods: {
    onLoad() {
      this.loading = true;
      const query = this.getQuery(this.params);

      getUsers(query)
        .then(async (resp) => {
          this.loading = false;
          if (resp.status != "OK") {
            return;
          }
          this.users = resp.message.content;
          // 分頁設定
          this.setPagination(resp.message);
          // 項次
          for (let user of this.users) {
            this.page.seq++;
            user.seq = this.page.seq;
          }
        })
        .catch((e) => {
          this.loading = false;
          console.log(e);
          //this.warning("執行查詢異常");
        });
    },
    onOpenModal(val) {
      this.user = this.newUser();
      this.userRoles = [];
      this.dialogs.account.title = "新增帳號";
      this.Small.action = "新增";
      this.Small.cancel = "取消";
      // 編輯帳號
      if (val != null) {
        this.user = val;
        this.user.roles.forEach((element) => {
          this.userRoles.push(element.id);
        });
        this.Small.action = "存檔";
        this.dialogs.account.title = "編輯帳號";
      }
      this.dialogs.account.visible = true;
    },
    async onModalClose(ref) {
      if (ref.success == undefined || ref.success == false) {
        this.dialogs.account.visible = false;
        this.dialogs.password.visible = false;
        return;
      }
      // 新增/編輯帳號
      if (ref.name == "ACCOUNT") {
        this.dialogs.account.visible = false;
        this.$refs.user.validate(async (valid) => {
          if (valid == false) {
            this.warning("帳號資料未輸入完整！");
            return;
          }
          if (this.userRoles.length <= 0) {
            this.warning("未選擇角色資料！");
            return;
          }
          const roles = [];
          // 權限
          this.userRoles.forEach((e) => {
            roles.push({ id: e });
          });
          const user = {
            roles: roles,
            account: this.user.account,
            userName: this.user.userName,
            employeeId: this.user.employeeId,
            email: this.user.email,
            phone: this.user.phone,
            enableDate: this.toDateTime(this.user.enableDate),
            disableDate: this.toDateTime(this.user.disableDate),
            orgId: this.user.orgId,
            isEnable: this.user.isEnable,
            id: this.user.id,
            password: "",
          };
          if (user.id == 0) {
            addUser(user).then((resp) => {
              if (resp.message.body) {
                this.warning(resp.message.body.message);
              }
              this.onLoad();
            });
          } else {
            setUser(this.user.id, user).then((resp) => {
              this.onLoad();
            });
          }
        });
      }
      // 變更密碼
      if (ref.name == "PASSWORD") {
        if (ref.success == true) {
          changPassword(
            this.user.id,
            this.password.originalPassword,
            this.password.newPassword
          );
        }
        this.dialogs.password.visible = false;
      }
    },
    onChangPassword() {
      this.password.originalPassword = "";
      this.password.newPassword = "";
      this.dialogs.password.visible = true;
    },
    ondblClick(val) {
      this.onOpenModal(val);
    },
    onSortcChange(val) {
      this.params.direction = "ASC";
      if (val.order == "descending") {
        this.params.direction = "DESC";
      }
      this.params.properties = val.prop;
      this.onLoad();
    },
    onCurrentChange(val) {
      this.params.page = val;
      this.onLoad();
    },
    newUser() {
      var user = {
        roles: [],
        account: "",
        userName: "",
        employeeId: "",
        email: "",
        phone: "",
        enableDate: this.toDateTime(new Date()),
        disableDate: "",
        orgId: 1,
        isEnable: true,
        id: 0,
        password: "",
      };
      return user;
    },
  },
};
</script>
<style scoped></style>
