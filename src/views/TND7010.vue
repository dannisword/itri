<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="80px" :inline="true">
        <el-form-item label="角色名稱">
          <el-input v-model="params.roleName"></el-input>
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
          <el-button type="success" @click="onSetRole(null)"
            >新增角色</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 分頁 -->
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
    <el-table :data="roles.content" class="table-container" border stripe>
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="角色編號" prop="code" width="180">
      </el-table-column>
      <el-table-column label="角色名稱" prop="name"> </el-table-column>
      <el-table-column label="狀態" prop="statusName" width="125">
      </el-table-column>

      <el-table-column label="編輯名稱與狀態" width="200" align="center">
        <template slot-scope="scope">
          <div>
            <el-button @click="onSetRole(scope.row)" size="mini" type="primary"
              >編輯
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="編輯權限" width="200" align="center">
        <template slot-scope="scope">
          <el-button @click="onSetMenus(scope.row)" size="mini" type="primary"
            >編輯
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/修改角色-->
    <ModalDialog
      :title="dialogs.role.title"
      :name="dialogs.role.name"
      :visible.sync="dialogs.role.visible"
      @afterClosed="onModalClose"
    >
      <el-form ref="role" :model="role" label-width="100px">
        <el-form-item label="角色編號">
          <el-input v-model="role.code" :disabled="role.id > 0"></el-input>
        </el-form-item>
        <el-form-item label="角色名稱">
          <el-input v-model="role.name"></el-input>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="role.isEnable" placeholder="請選擇">
            <el-option
              v-for="item in status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </ModalDialog>

    <!-- 編輯權限 -->
    <ModalDialog
      :title="dialogs.menu.title"
      :name="dialogs.menu.name"
      :visible.sync="dialogs.menu.visible"
      @afterClosed="onModalClose"
    >
      <el-table
        :data="privileges"
        class="table-container"
        border
        stripe
        height="400px"
      >
        <el-table-column label="功能名稱" prop="description"> </el-table-column>

        <el-table-column label="使用權限" prop="permission">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.permission"></el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getRoles, addRole, setRole } from "@/api/role";
import {
  getPrivilegeAll,
  getRolePrivilege,
  setRolePrivilege,
} from "@/api/privilege";
import { getPrivileges, success } from "@/utils/app";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      params: {
        roleName: "",
        isEnable: true,
        page: 0,
        size: 10,
        direction: "ASC",
        properties: "id",
      },
      dialogs: {
        role: {
          title: "新增角色",
          name: "ROLE",
          visible: false,
        },
        menu: {
          title: "編輯權限",
          name: "ROLE-MENU",
          visible: false,
        },
      },
      role: {},
      roles: [],
      menus: [],
      privileges: [],
    };
  },
  computed: {},
  async created() {
    this.status = this.source.status;
    this.menus = await getPrivileges();
    this.onLoad();
  },
  methods: {
    async onLoad() {
      const query = this.getQuery(this.params);
      this.roles = await getRoles(query);

      this.setPagination(this.roles);
      // 處理狀態
      for (let role of this.roles.content) {
        role.statusName = role.isEnable == true ? "啟用" : "停用";
      }
    },
    onSetRole(val) {
      if (val != null) {
        this.role = val;
        this.dialogs.role.title = "編輯名稱與狀態";
      } else {
        this.role = this.newRole();
        this.dialogs.role.title = "新增角色";
      }
      this.dialogs.role.visible = true;
    },
    async onSetMenus(val) {
      // 編輯權限
      const data = await getRolePrivilege(val.id);
      this.role = val;
      this.privileges = [];
      for (let menu of this.menus) {
        var p = data.message.find((x) => x.privilegeId == menu.id);
        let permission = false;
        if (p) {
          permission = p.permission;
        }
        this.privileges.push({
          roleId: val.id,
          description: menu.description,
          privilegeId: menu.id,
          permission: permission,
        });
      }

      this.dialogs.menu.visible = true;
    },
    async onModalClose(dialogRef) {
      this.dialogs.role.visible = false;
      this.dialogs.menu.visible = false;

      if (dialogRef.success == false) {
        return;
      }
      // 新增或編輯角色
      if (dialogRef.name == "ROLE") {
        let resp;
        if (this.role.id == 0) {
          resp = await addRole(this.role);
        } else {
          resp = await setRole(this.role.id, this.role);
        }
        console.log(resp);
        if (resp.status == "OK") {
          this.success("角色資料異動成功！");
        }
      }
      // 編輯權限
      if (dialogRef.name == "ROLE-MENU") {
        var data = this.privileges.map((d) => {
          return {
            roleId: d.roleId,
            privilegeId: d.privilegeId,
            permission: d.permission,
          };
        });
        setRolePrivilege(this.role.id, data).then((resp) => {
          if (resp.status == "OK") {
            this.success("角色權限異動成功！");
          }
        });
      }
      await this.onLoad();
    },
    onSizeChange(val) {},
    onCurrentChange(val) {},
    newRole() {
      return {
        id: 0,
        code: "",
        name: "",
        isEnable: true,
      };
    },
  },
};
</script>
<!-- 
  https://www.logistics.org.tw/tenacity/api/role/privilege/2

-->
