<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="form" label-width="80px" :inline="true">
        <el-form-item label="儲區編號">
          <el-input v-model="params.locationId"></el-input>
        </el-form-item>
        <el-form-item label="儲位編號">
          <el-input v-model="params.storageId"></el-input>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="params.status" placeholder="請選擇">
            <el-option
              v-for="item in locationStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-divider class="form-divider"></el-divider>
        <el-form-item label="走道代碼">
          <el-input v-model="params.aisle"></el-input>
        </el-form-item>
        <el-form-item label="第幾層">
          <el-input v-model="params.level"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 功能鍵及分頁-->
    <el-row type="flex" class="mt-1">
      <el-col :span="8">
        <el-button type="primary" @click="onSetStatus('BATCH')"
          >批次更新狀態</el-button
        >
        <el-button type="primary" @click="onSetStatus('ASSIGN')"
          >更新指定層</el-button
        >
      </el-col>
      <el-col :span="16" align="end">
        <el-pagination
          background
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
          :current-page="page.currentPage"
          :page-sizes="[5, 10, 15]"
          :page-size="page.pagesize"
          layout="total,jumper,prev, pager, next"
          :total="page.totalPage"
        ></el-pagination>
      </el-col>
    </el-row>
    <!-- TABLE -->
    <el-table :data="storages" class="table-container" border stripe>
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="項次" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="儲區編號" width="100" prop="locationId" fixed>
      </el-table-column>
      <el-table-column label="走道代碼" width="100" prop="aisle">
      </el-table-column>
      <el-table-column label="第幾層" width="100" prop="level">
      </el-table-column>
      <el-table-column label="第幾格" width="100" prop="bay"> </el-table-column>
      <el-table-column label="所在深度" width="100" prop="depth">
      </el-table-column>
      <el-table-column label="儲位編號" width="100" prop="storageId">
      </el-table-column>
      <el-table-column label="別名" width="100" prop="aisleCode">
      </el-table-column>

      <el-table-column label="物流箱編號" width="200" prop="boxNumber">
      </el-table-column>
      <el-table-column label="是否為空箱" width="100" prop="isEmptyCarrier">
        <template> </template>
      </el-table-column>
      <el-table-column label="狀態" width="100" prop="status">
      </el-table-column>
      <el-table-column label="編輯" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="onSetStorage(scope.row)"
            >編輯
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 編輯欄位 -->
    <ModalDialog
      :title="dialogs.storage.title"
      :name="dialogs.storage.name"
      :visible.sync="dialogs.storage.visible"
      @afterClosed="onModalClose"
    >
      <el-form ref="form" :model="storage" label-width="100px">
        <el-form-item label="儲位編號">
          <el-input
            v-model="storage.storageId"
            :disabled="storage.id > 0"
          ></el-input>
        </el-form-item>
        <el-form-item label="別名">
          <el-input v-model="storage.aisleCode"></el-input>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="storage.statusId" placeholder="請選擇">
            <el-option
              v-for="item in form.status"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </ModalDialog>
    <!-- 批次更新 -->
    <ModalDialog
      :title="dialogs.batch.title"
      :name="dialogs.batch.name"
      :visible.sync="dialogs.batch.visible"
      :optional="optional"
      @afterClosed="onModalClose"
    >
      共選擇
    </ModalDialog>
    <!-- 更新指定層 -->
    <ModalDialog
      :title="dialogs.assign.title"
      :name="dialogs.assign.name"
      :visible.sync="dialogs.assign.visible"
      :optional="optional"
      @afterClosed="onModalClose"
    >
      <el-form ref="form" :model="storage" label-width="100px">
        <el-form-item label="走道">
          <el-input
            v-model="storage.aisle"
            :disabled="storage.id > 0"
          ></el-input>
        </el-form-item>
        <el-form-item label="層">
          <el-input v-model="storage.level"></el-input>
        </el-form-item>
      </el-form>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getSelector } from "@/api/system";
import { getStations } from "@/api/station";
export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      locationStatus: [],
      storage: {},
      storages: [],
      params: {
        aisle: "",
        direction: "ASC",
        level: 0,
        locationId: "",
        page: 0,
        properties: "id",
        size: 10,
        status: 0,
        storageId: "",
      },

      form: { status: [] },

      data: [],
      dialogs: {
        storage: {
          title: "編輯儲位",
          name: "STROAGE",
          visible: false,
        },
        batch: {
          title: "批次更新狀態",
          name: "BATCH",
          visible: false,
        },
        assign: {
          title: "更新指定層",
          name: "ASSIGN",
          visible: false,
        },
      },
      optional: {
        size: "Small",
        action: "可用",
        cancel: "保留",
      },
    };
  },
  computed: {},
  created() {
    getSelector("LOCATION_STATUS").then((resp) => {
      this.locationStatus = resp.message;
    });
  },
  methods: {
    onSimulation() {
      this.form.status = this.source.status;
      this.data = this.source.A107;
    },
    onSetStorage(val) {
      this.storage = val;
      this.dialogs.storage.visible = true;
    },
    onSetStatus(val) {
      if (val == "BATCH") {
        this.dialogs.batch.visible = true;
      }
      if (val == "ASSIGN") {
        this.dialogs.assign.visible = true;
      }
    },
    onModalClose(dialogRef) {
      if (dialogRef.name == "STROAGE") {
        this.dialogs.storage.visible = false;
      }
      if (dialogRef.name == "BATCH") {
        this.dialogs.batch.visible = false;
      }
      if (dialogRef.name == "ASSIGN") {
        this.dialogs.assign.visible = false;
      }
    },
    onLoad() {
      const query = this.getQuery(this.params);
      console.log(query);
      getStations(query).then((resp) => {
        console.log(resp);
        if (resp.status == "OK") {
          this.storages = resp.message.content;
        }
      });
    },
    onSizeChange(val) {},
    onCurrentChange(val) {},
  },
};
</script>
