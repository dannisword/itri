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
          <el-select v-model="params.status" multiple placeholder="請選擇">
            <el-option
              v-for="item in locationStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <!--
        <el-divider class="form-divider"></el-divider>
        -->
        <el-form-item label="走道代碼">
          <el-input v-model="params.aisle"></el-input>
        </el-form-item>
        <el-form-item label="第幾層">
          <el-input v-model="params.level"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
          <el-button type="success" @click="onSetStatus('BATCH')"
            >批次更新狀態</el-button
          >
          <el-button type="success" @click="onSetStatus('ASSIGN')"
            >更新指定層</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 功能鍵及分頁-->
    <el-row type="flex" class="mt-1">
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

    <!-- TABLE -->
    <el-table
      :data="storages"
      v-loading="loading"
      class="table-container"
      border
      stripe
      @selection-change="onSelectionChange"
      @sort-change="onSortcChange"
    >
      <el-table-column
        type="selection"
        :selectable="canSelectRow"
      ></el-table-column>
      <el-table-column label="項次" width="80" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="儲區編號"
        width="120"
        prop="locationId"
        fixed
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="走道代碼"
        width="120"
        prop="aisle"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="第幾層"
        width="100"
        prop="level"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column label="第幾格" width="100" prop="bay" sortable="custom">
      </el-table-column>

      <el-table-column
        label="所在深度"
        width="120"
        prop="depth"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="儲位編號"
        min-width="180"
        prop="storageId"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="別名"
        min-width="180"
        prop="alias"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="物流箱編號"
        min-width="180"
        prop="carrierId"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column
        label="是否為空箱"
        align="center"
        width="180"
        prop="isEmptyCarrier"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.isEmptyCarrier | formatEmpty }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="狀態"
        width="100"
        prop="statusName"
        sortable="custom"
      >
      </el-table-column>

      <el-table-column label="編輯" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="onEditStorage(scope.row)"
            v-if="scope.row.status < 2"
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
          <el-input v-model="storage.storageId" disabled></el-input>
        </el-form-item>
        <el-form-item label="別名">
          <el-input v-model="storage.alias"></el-input>
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

    <!-- 鎖定訊息提示 -->
    <ModalDialog
      :title="dialogs.LOCK.title"
      :name="dialogs.LOCK.name"
      :visible.sync="dialogs.LOCK.visible"
      :optional="dialogs.LOCK.optional"
      @afterClosed="onMessage"
    >
      <span style="font-size: 20px">{{ message }}</span>
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
      loading: false,
      checkOnLock: true,
      message: "",
      storage: {},
      storages: [],
      selected: {
        storages: [],
      },
      assign: {
        aisle: "",
        level: "",
        status: 0,
      },
      params: {
        aisle: "",
        direction: "ASC",
        level: "",
        locationId: "",
        page: 1,
        properties: "storageId",
        size: 50,
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
        LOCK: {
          title: "物流箱允入設定",
          name: "LOCK",
          visible: false,
          optional: {
            size: "Small",
            action: "先修改其他儲位",
            cancel: "取消動作",
            showAction: true,
          },
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
    this.onLoad();
  },
  methods: {
    onLoad() {
      this.loading = true;
      const query = this.getQuery(this.params, false);
      getStations(query)
        .then((resp) => {
          if (resp.status == "OK") {
            this.storages = resp.message.content;
            // 分頁設定
            this.setPagination(resp.message);
            // 處理項次
            for (let item of this.storages) {
              this.page.seq++;
              item.seq = this.page.seq;
            }
            this.loading = false;
          }
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    onEditStorage(val) {
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
    onModalClose(dialogRef) {
      this.dialogs.storage.visible = false;
      this.dialogs.batch.visible = false;
      this.dialogs.assign.visible = false;

      if (dialogRef.success == undefined) {
        return;
      }
      // 編輯儲位
      if (dialogRef.name == "EDIT" && dialogRef.success == true) {
        const data = this.getQuery(
          {
            alias: this.storage.alias,
            status: this.storage.status,
          },
          false
        );

        setStation(this.storage.storageId, data).then((resp) => {
          if (resp.status == "OK") {
            this.success("編輯儲位完成!");
            this.onLoad();
          }
        });
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
        this.loading = true;
        setBatch(this.checkOnLock, data)
          .then((resp) => {
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
          })
          .catch((e) => {
            this.loading = false;
          });
      }
      // 更新指定層
      if (dialogRef.name == "ASSIGN") {
        this.assign.status =
          dialogRef.success == true
            ? LocationStatusEnum.AVAILABLE
            : LocationStatusEnum.RESERVE;

        this.setAssign(this.assign);
      }
    },
    onMessage(dialogRef) {
      this.dialogs.LOCK.visible = false;
      if (dialogRef.success == undefined || dialogRef.success == false) {
        this.checkOnLock = true;
        return;
      }
      this.setAssign(this.assign);
    },
    onSelectionChange(val) {
      this.checkOnLock = true;
      this.selected.storages = val;
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
    setAssign(data) {
      const query = this.getQuery(data, false);
      this.loading = true;
      setRange(this.checkOnLock, query)
        .then((resp) => {
          this.checkOnLock = resp.status == 200 ? false : true;
          this.loading = false;
          if (resp.status == 200) {
            this.message = resp.errorMessage;
            this.dialogs.LOCK.visible = true;
            return;
          }
          if (resp.status == "OK") {
            this.checkOnLock = true;
            this.success("更新指定層完成");
            this.onLoad();
          }
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    canSelectRow(row, index) {
      return row.status < 2;
    },
  },
};
</script>
