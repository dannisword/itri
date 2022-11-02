<template>
  <div class="app-container">
    <!-- 查詢條件 -->
    <div class="form-container">
      <el-form :model="params" label-width="80px" :inline="true">
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
          :page-size="page.pagesize"
          layout="total,jumper,prev, pager, next"
          :total="page.totalPage"
        ></el-pagination>
      </el-col>
    </el-row>
    <!-- TABLE -->
    <el-table
      :data="storages"
      class="table-container"
      border
      stripe
      @selection-change="onSelectionChange"
    >
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
      <el-table-column
        label="是否為空箱"
        align="center"
        width="100"
        prop="isEmptyCarrier"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.isEmptyCarrier | formatEmpty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="狀態" width="100" prop="statusName">
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
          <el-input v-model="storage.aisle"></el-input>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="storage.status" placeholder="請選擇">
            <el-option
              v-for="item in locationStatus"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </ModalDialog>

    <!-- 批次更新狀態 -->
    <ModalDialog
      :title="dialogs.batch.title"
      :name="dialogs.batch.name"
      :visible.sync="dialogs.batch.visible"
      :optional="optional"
      @afterClosed="onModalClose"
    >
      共選擇 {{ selected.storages.length }} 筆儲位，請點擊按鍵以更新狀態
    </ModalDialog>
    <!-- 更新指定層 -->
    <ModalDialog
      :title="dialogs.assign.title"
      :name="dialogs.assign.name"
      :visible.sync="dialogs.assign.visible"
      :optional="optional"
      @afterClosed="onModalClose"
    >
      <el-form :model="storage" label-width="100px">
        <el-form-item label="走道">
          <el-input v-model="assign.aisle"></el-input>
        </el-form-item>
        <el-form-item label="層">
          <el-input v-model="assign.level"></el-input>
        </el-form-item>
      </el-form>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getSelector } from "@/api/system";
import { getStations, setStation, setBatch, setRange } from "@/api/station";
import { SelectTypeEnum, LocationStatusEnum } from "@/utils/enums/index";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      locationStatus: [],
      checkOnLock: true,
      storage: {},
      storages: [],
      selected: {
        storages: [],
      },
      assign: {
        aisle: "",
        level: "",
      },
      params: {
        aisle: "",
        direction: "ASC",
        level: "",
        locationId: "",
        page: 1,
        properties: "id",
        size: 10,
        status: 0,
        storageId: "",
      },
      status: [],
      dialogs: {
        storage: {
          title: "編輯儲位",
          name: "EDIT",
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
        showAction: true,
      },
    };
  },
  computed: {},
  created() {
    getSelector(SelectTypeEnum.LOCATION_STATUS).then((resp) => {
      this.locationStatus = resp.message;
    });
  },
  methods: {
    onLoad() {
      const query = this.getQuery(this.params, true);
      getStations(query).then((resp) => {
        if (resp.status == "OK") {
          this.storages = resp.message.content;
          // 項次
          const pageable = resp.message.pageable;
          let index = this.getIndex(pageable);
          this.storages.forEach((elm) => {
            elm.id = index;
            index++;
          });
        }
      });
    },
    onSetStorage(val) {
      this.storage = val;
      this.dialogs.storage.visible = true;
    },
    onSetStatus(val) {
      if (val == "BATCH") {
        if (this.selected.storages.length <= 0) {
          this.warning("請勾選批次變更");
          return;
        }

        this.dialogs.batch.visible = true;
      }
      if (val == "ASSIGN") {
        this.dialogs.assign.visible = true;
      }
    },
    getEmpty(val) {
      if (val == true) {
        return "是";
      }
      return "否,";
    },
    onModalClose(dialogRef) {
      if (dialogRef.success == undefined) {
        return;
      }
      if (dialogRef.name == "EDIT") {
        const data = {
          alias: this.storage.alias,
          status: this.storage.status,
        };
        setStation(this.storage.storageId, data).then((resp) => {
          if (resp.status == "OK") {
            this.success("編輯儲位完成!");
            this.onLoad();
          }
        });
        this.dialogs.storage.visible = false;
      }
      // 批次更新狀態
      if (dialogRef.name == "BATCH") {
        const storageIds = [];
        var data = {
          status:
            dialogRef.success == true
              ? LocationStatusEnum.AVAILABLE
              : LocationStatusEnum.RESERVE,
          storageIds: [],
        };
        this.selected.storages.forEach((elm) => {
          data.storageIds.push(elm.storageId);
        });

        setBatch(this.checkOnLock, data).then((resp) => {
          this.checkOnLock = resp.status == 200 ? false : true;
          if (resp.status == 200) {
            this.warning(resp.errorMessage, 5000);
            return;
          }
          if (resp.status == "OK") {
            this.checkOnLock = true;
            this.success("批次更新狀態完成");
            this.onLoad();
          }
        });
        this.dialogs.batch.visible = false;
      }
      // 更新指定層
      if (dialogRef.name == "ASSIGN") {
        var data = {
          status:
            dialogRef.success == true
              ? LocationStatusEnum.AVAILABLE
              : LocationStatusEnum.RESERVE,
          aisle: this.assign.aisle,
          level: this.assign.level,
        };

        const query = this.getQuery(data, false);

        setRange(this.checkOnLock, query).then((resp) => {
          this.checkOnLock = resp.status == 200 ? false : true;
          if (resp.status == 200) {
            this.warning(resp.errorMessage, 5000);
            return;
          }
          if (resp.status == "OK") {
            this.checkOnLock = true;
            this.success("更新指定層完成");
            this.onLoad();
          }
        });
        this.dialogs.assign.visible = false;
      }
    },
    onSelectionChange(val) {
      this.checkOnLock = true;
      this.selected.storages = val;
    },
    onSizeChange(val) {},
    onCurrentChange(val) {},
  },
};
</script>
