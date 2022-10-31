<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form ref="params" :model="params" label-width="100px" :inline="true">
        <el-form-item label="帳號">
          <el-input v-model="params.account"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="params.userName"></el-input>
        </el-form-item>
        <el-form-item label="角色名稱">
          <el-select v-model="params.roleId" placeholder="請選擇">
            <el-option
              v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="params.isEnable" placeholder="請選擇">
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-divider class="form-divider"></el-divider>
        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
          <el-button type="success" @click="onOpenModal(null)"
            >新增帳號</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- 分頁底部 -->
    <el-row type="flex">
      <el-col :span="8"> </el-col>
      <el-col :span="16" align="end">
        <el-pagination
          background
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
          :current-page="page.number"
          :page-size="page.size"
          layout="total,jumper,prev, pager, next"
          :total="page.totalPages"
        ></el-pagination>
      </el-col>
    </el-row>
    <!-- 資料 -->
    <el-table
      :data="users"
      class="table-container"
      border
      stripe
      @cell-dblclick="ondblClick"
    >
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="帳號" prop="account" fixed> </el-table-column>
      <el-table-column label="姓名" prop="userName" width="120"> </el-table-column>
      <el-table-column label="角色名稱" prop="roleName" width="200"> </el-table-column>
      <el-table-column label="狀態" prop="isEnable" >
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
    >
      <div>
        <el-form ref="form" :model="user" label-width="100px">
          <el-form-item label="帳號">
            <el-input v-model="user.account"></el-input>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="user.userName"></el-input>
          </el-form-item>
          <el-form-item label="角色名稱">
            <el-select v-model="userRoles" multiple placeholder="請選擇">
              <el-option
                v-for="item in roles"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="float: left">{{ item.name }}</span>
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
          <el-form-item>
            <el-button type="success" @click="onChangPassword()"
              >修改密碼</el-button
            >
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
      <el-form ref="password" :model="password" label-width="150px">
        <el-form-item label="輸入新密碼">
          <el-input
            type="password"
            v-model="password.originalPassword"
          ></el-input>
        </el-form-item>
        <el-form-item label="再次輸入新密碼">
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
import { getRoles } from "@/api/role";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      params: {
        account: "",
        userName: "",
        roleId: 0,
        isEnable: true,
        page: 0,
        size: 10,
        direction: "ASC",
        properties: "id",
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
      optional: {
        size: "Large",
      },
    };
  },
  async created() {
    this.status = this.source.status;
    var data = await getRoles();
    this.roles = data.content;
    await this.onLoad();
  },
  watch: {
    user: {
      handler: function (newVal, oldVal) {
        console.log(newVal);
      },
      deep: true,
    },
  },
  methods: {
    onLoad() {
      // 處理資料轉換
      const query = this.getQuery(this.params);
      getUsers(query)
        .then(async (resp) => {
          if (resp.status != "OK") {
            return;
          }
          console.log(resp);
          this.users = resp.message.content;
          // 項次
          const pageable = resp.message.pageable;
          let index = this.getIndex(pageable);

          for (let user of this.users) {
            let name = "";
            for (let role of user.roles) {
              if (name == "") {
                name = role.name;
              } else {
                name += `, ${role.name}`;
              }
              role.isEnable = true;
            }
            user.roleName = name;
            user.seq = index;
            index++;
          }
        })
        .catch((e) => {
          console.log(e);
          //this.warning("執行查詢異常");
        });
    },
    onOpenModal(val) {
      this.user = this.newUser();
      this.userRoles = [];
      this.dialogs.account.title = "新增帳號";
      // 編輯帳號
      if (val != null) {
        this.user = val;
        this.user.roles.forEach((element) => {
          this.userRoles.push(element.id);
        });
        this.dialogs.account.title = "編輯帳號";
      }
      this.dialogs.account.visible = true;
    },
    onModalClose(ref) {
      if (ref.name == "ACCOUNT") {
        this.dialogs.account.visible = false;

        if (ref.success == true) {
          const roles = [];
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
            addUser(user);
          } else {
            setUser(this.user.id, user);
          }
          this.onLoad();
        }
      }
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
    onSizeChange(val) {},
    onCurrentChange(val) {},
    newUser() {
      var user = {
        roles: [],
        account: "",
        userName: "",
        employeeId: "9901",
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
<style scoped>
.el-input {
  width: 200px;
}
</style>
