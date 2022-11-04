<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="80px" :inline="true">
        <el-form-item label="角色名稱">
          <el-input v-model="params.roleName"></el-input>
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
      :data="roles"
      class="table-container"
      border
      stripe
      @sort-change="onSortcChange"
    >
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="角色編號"
        prop="code"
        min-width="180"
        sortable="custom"
        fixed
      >
      </el-table-column>
      <el-table-column
        label="角色名稱"
        prop="name"
        min-width="180"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="狀態" prop="isEnable" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.isEnable | formatEnable() }}</span>
        </template>
      </el-table-column>

      <el-table-column label="編輯名稱與狀態" width="180" align="center">
        <template slot-scope="scope">
          <div>
            <el-button @click="onSetRole(scope.row)" size="mini" type="primary"
              >編輯
            </el-button>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="編輯權限" width="180" align="center">
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
      :optional="Small"
    >
      <el-form ref="role" :model="role" label-width="100px" :rules="rules">
        <el-form-item label="角色編號" prop="code">
          <el-input v-model="role.code" :disabled="role.id > 0"></el-input>
        </el-form-item>
        <el-form-item label="角色名稱" prop="name">
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
      <el-tree
        ref="tree"
        :data="menus"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        default-expand-all
        :expand-on-click-node="false"
      >
        <span slot-scope="{ node, data }">
          <span> {{ node.label }}</span>
        </span>
      </el-tree>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getRoles, addRole, setRole } from "@/api/role";
import { getRolePrivilege, setRolePrivilege } from "@/api/privilege";
import { getMenus } from "@/utils/app";
import { validLetters, validEmpty } from "@/utils/validate";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    const validateLetters = (rule, value, callback) => {
      if (validEmpty(value) == true) {
        callback(new Error("請輸入角色編號"));
      } else if (validLetters(value) == true) {
        callback(new Error("請輸入英數字"));
      } else {
        callback();
      }
    };
    const validatezName = (rule, value, callback) => {
      if (validEmpty(value) == true) {
        callback(new Error("請輸入角色名稱"));
      } else {
        callback();
      }
    };
    return {
      rules: {
        code: [{ required: true, trigger: "blur", validator: validateLetters }],
        name: [{ required: true, trigger: "blur", validator: validatezName }],
      },
      params: {
        roleName: "",
        isEnable: [],
        page: 1,
        size: 50,
        direction: "ASC",
        properties: "code",
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
      defaultProps: {
        children: "childrens",
        label: "description",
      },
    };
  },
  computed: {},
  async created() {
    this.status = this.source.status;
    this.menus = await getMenus();
    this.onLoad();
  },
  methods: {
    async onLoad() {
      const query = this.getQuery(this.params);
      const resp = await getRoles(query);
      this.roles = resp.content;
      // 分頁設定
      this.setPagination(resp);
      // 處理項次
      for (let role of this.roles) {
        this.page.seq++;
        role.seq = this.page.seq;
      }
    },
    onSetRole(val) {
      this.Small.action = "新增";
      this.Small.cancel = "取消";
      if (val != null) {
        this.role = val;
        this.Small.action = "存檔";
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
      console.log(data);
      this.role = val;
      //
      const nodes = [];
      for (let menu of this.menus) {
        var p = data.message.find((x) => x.privilegeId == menu.id);
        if (p && p.permission == true) {
          nodes.push({ id: menu.id, label: menu.description });
        }
        //
        if (menu.childrens == undefined) {
          continue;
        }
        for (let child of menu.childrens) {
          var p = data.message.find((x) => x.privilegeId == child.id);
          if (p && p.permission == true) {
            nodes.push({ id: child.id, label: child.description });
          }
        }
      }
      // 再一次渲染
      this.$nextTick(() => {
        this.$refs.tree.setCheckedNodes(nodes);
      });

      this.dialogs.menu.visible = true;
    },
    async onModalClose(dialogRef) {
      this.dialogs.role.visible = false;
      this.dialogs.menu.visible = false;

      if (dialogRef.success == undefined || dialogRef.success == false) {
        return;
      }
      // 新增或編輯角色
      if (dialogRef.name == "ROLE") {
        this.$refs.role.validate(async (valid) => {
          if (valid == false) {
            this.warning("角色資料未輸入完整！");
            return;
          }
          let resp;
          if (this.role.id == 0) {
            resp = await addRole(this.role);
          } else {
            resp = await setRole(this.role.id, this.role);
          }

          if (resp.status == "OK") {
            this.success("角色資料異動成功！");
          }
        });
      }
      // 編輯權限
      if (dialogRef.name == "ROLE-MENU") {
        const selected = this.$refs.tree.getCheckedKeys();
        let data = [];
        for (let item of selected) {
          data.push({
            roleId: this.role.id,
            privilegeId: item,
            permission: true,
          });
        }
        setRolePrivilege(this.role.id, data).then((resp) => {
          if (resp.status == "OK") {
            this.success("角色權限異動成功！");
          }
        });
      }
      await this.onLoad();
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
