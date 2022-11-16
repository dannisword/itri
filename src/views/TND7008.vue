<template>
  <div class="app-container">
    <div class="form-container">
      <!-- 查詢條件 -->
      <el-form ref="params" :model="params" label-width="100px" :inline="true">
        <el-form-item label="建立日期">
          <el-date-picker
            v-model="nowDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="物流箱動作">
          <el-select v-model="params.status" multiple placeholder="請選擇">
            <el-option
              v-for="item in carrierStatus"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="狀態">
          <el-select v-model="params.isEnable" multiple placeholder="請選擇">
            <el-option
              v-for="item in enabledTyps"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="物流箱編號">
          <el-input v-model="params.carriedId"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onLoad()">查詢</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="warning" @click="onOpenModal('NEW')"
            >新增物流箱</el-button
          >
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="onOpenModal('ALLOWED')"
            >物流箱允入設定</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 功能鍵及分頁-->
    <el-row type="flex" class="mt-1">
      <el-col :span="16">
        <el-button type="primary" @click="onPrint()">列印勾選項目</el-button>
        <el-button type="success" @click="onOpenModal('BATCH')"
          >批次更新狀態</el-button
        >
        <el-button type="info" @click="onNav('/TND7011')"
          >物流箱歷程查詢</el-button
        >
      </el-col>
      <el-col :span="8" align="end">
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

    <!-- 資料表 -->
    <el-table
      :data="carriers"
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
      
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column
        label="物流箱編號"
        width="180"
        prop="id"
        fixed
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="建立日期"
        width="180"
        prop="createTime"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="建立人員"
        width="180"
        prop="creator"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="物流箱動作"
        width="180"
        prop="statusName"
        sortable="custom"
      >
      </el-table-column>
      <el-table-column
        label="狀態"
        width="100"
        prop="isEnable"
        sortable="custom"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.isEnable | formatEnable() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品料號" min-width="180" prop="materialNo">
      </el-table-column>
      <el-table-column label="所在儲位/站點" width="180" prop="stationCode">
      </el-table-column>

      <el-table-column label="編輯狀態" align="center" width="180">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="onEdit(scope.row)"
            v-if="canEdit(scope.row)"
            >編輯
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增物流箱-->
    <ModalDialog
      :title="dialogs.NEW.title"
      :name="dialogs.NEW.name"
      :visible.sync="dialogs.NEW.visible"
      :optional="dialogs.NEW.optional"
      @afterClosed="onNew"
    >
      <p>請輸入要新增的物流箱數量</p>
      <el-input v-model="newNumber" type="number"></el-input>
    </ModalDialog>

    <!-- 物流箱允入設定 -->
    <ModalDialog
      :title="dialogs.ALLOWED.title"
      :name="dialogs.ALLOWED.name"
      :visible.sync="dialogs.ALLOWED.visible"
      :optional="dialogs.ALLOWED.optional"
      @afterClosed="onAllowed"
    >
      <el-form label-width="120px">
        <el-form-item label="重量限制(KG)">
          <el-input
            v-model="allowed.weightLimit"
            type="number"
            min="0"
          ></el-input>
        </el-form-item>
        <el-form-item label="誤差允許值(KG)">
          <el-input
            v-model="allowed.tolerance"
            type="number"
            min="0"
            step="0.01"
          ></el-input>
        </el-form-item>
        <el-form-item label="空箱重量(KG)">
          <el-input
            v-model="allowed.emptyWeight"
            type="number"
            min="0"
            step="0.01"
          ></el-input>
        </el-form-item>
      </el-form>
    </ModalDialog>

    <!-- 編輯狀態 -->
    <ModalDialog
      :title="dialogs.EDIT.title"
      :name="dialogs.EDIT.name"
      :visible.sync="dialogs.EDIT.visible"
      :optional="dialogs.EDIT.optional"
      @afterClosed="onSave"
    >
      <el-form label-width="120px">
        <el-form-item label="物流箱編號">
          <el-input v-model="carrier.id" disabled></el-input>
        </el-form-item>

        <el-form-item label="狀態">
          <el-select v-model="carrier.isEnable" placeholder="請選擇">
            <el-option
              v-for="item in enabledTyps"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </ModalDialog>

    <!-- 批次更新狀態 -->
    <ModalDialog
      :title="dialogs.BATCH.title"
      :name="dialogs.BATCH.name"
      :visible.sync="dialogs.BATCH.visible"
      :optional="dialogs.BATCH.optional"
      @afterClosed="onBatch"
    >
      <p>共選擇{{ selected.carriers.length }}個物流箱，請點擊按鍵以更新狀態</p>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getSelector } from "@/api/system";
import { SelectTypeEnum, CarrierStatusEnum } from "@/utils/enums/index";
import {
  getCarriers,
  addCarrier,
  configCarrier,
  enableCarrier,
  enableCarriers,
  printBarcode,
  getCarrierConfig,
} from "@/api/carrier";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      nowDate: [],
      carrierStatus: [],
      enabledTyps: [],
      carrier: {},
      carriers: [],
      allowed: {
        emptyWeight: 0,
        tolerance: 0,
        weightLimit: 0,
      },
      selected: {
        carriers: [],
      },
      params: {
        carriedId: "",
        direction: "ASC",
        endDate: "",
        isEnable: true,
        page: 1,
        properties: "id",
        size: 50,
        startDate: "",
        status: 0,
      },
      dialogs: {
        NEW: {
          title: "新增物流箱",
          name: "NEW",
          visible: false,
          optional: {
            size: "Small",
            action: "新增",
            cancel: "取消",
            showAction: true,
          },
        },
        EDIT: {
          title: "編輯狀態",
          name: "EDIT",
          visible: false,
          optional: {
            size: "Small",
            action: "存檔",
            cancel: "取消",
            showAction: true,
          },
        },
        BATCH: {
          title: "批次更新狀態",
          name: "BATCH",
          visible: false,
          optional: {
            size: "Small",
            action: "啟用",
            cancel: "停用",
            showAction: true,
          },
        },
        ALLOWED: {
          title: "物流箱允入設定",
          name: "ALLOWED",
          visible: false,
          optional: {
            size: "Small",
            action: "存檔",
            cancel: "取消",
            showAction: true,
          },
        },
      },
      newNumber: 0,
    };
  },
  created() {
    this.nowDate.push(this.addDay(-30));
    this.nowDate.push(this.addDay(0));
    // 物流箱動作
    getSelector(SelectTypeEnum.CARRIER_STATUS).then((resp) => {
      this.carrierStatus = resp.message;
    });
    // 狀態
    getSelector(SelectTypeEnum.ENABLED_TYPE).then((resp) => {
      this.enabledTyps = resp.message;
    });
    this.onLoad();
  },
  methods: {
    onLoad() {
      this.loading = true;
      this.params.startDate = this.toDate(this.nowDate[0]);
      this.params.endDate = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);

      getCarriers(query)
        .then((resp) => {
          if (resp.status == "OK") {
            this.carriers = resp.message.content;
            // 分頁設定
            this.setPagination(resp.message);
            // 處理項次
            for (let item of this.carriers) {
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
    onOpenModal(val) {
      // 新增
      if (val == "NEW") {
        this.newNumber = 0;
        this.dialogs.NEW.visible = true;
      }
      // 允入設定
      if (val == "ALLOWED") {
        getCarrierConfig().then((res) => {
          if (res.status == "OK") {
            this.allowed = res.message;
            this.dialogs.ALLOWED.visible = true;
          } else {
            this.warning("取得物流箱允入條件錯誤！");
          }
        });
      }
      // 批次更新狀態
      if (val == "BATCH") {
        if (this.selected.carriers.length <= 0) {
          this.warning("您尚未勾選要更新狀態的項目");
          return;
        }
        this.dialogs.BATCH.visible = true;
      }
    },
    onEdit(val) {
      this.carrier = val;
      this.dialogs.EDIT.visible = true;
    },
    onSave(val) {
      this.dialogs.EDIT.visible = false;
      if (val.success == undefined || val.success == false) {
        this.onLoad();
        return;
      }
      // 存檔
      enableCarrier(this.carrier.id, this.carrier.isEnable).then((resp) => {
        if (resp.status == "OK") {
          this.success("編輯狀態");
          this.onLoad();
        }
      });
    },
    onBatch(val) {
      this.dialogs.BATCH.visible = false;
      if (val.success == undefined) {
        return;
      }
      const data = {
        carrierIds: [],
        isEnable: val.success,
      };
      this.selected.carriers.forEach((elm) => {
        data.carrierIds.push(elm.id);
      });

      enableCarriers(true, data).then((resp) => {
        if (resp.status == "OK") {
          this.success("批次更新狀態成功！");
          this.onLoad();
        }
      });
    },
    onPrint() {
      if (this.selected.carriers.length <= 0) {
        this.warning("您尚未勾選欲列印的項目");
        return;
      }
      const data = [];
      this.selected.carriers.forEach((elm) => {
        data.push({
          id: elm.id,
          printCounts: 1,
        });
      });
      printBarcode(data).then((resp) => {
        if (resp.status == "OK") {
          this.success("列印物流箱條碼成功！");
        }
      });
    },
    onNew(val) {
      this.dialogs.NEW.visible = false;
      if (val.success == undefined || val.success == false) {
        return;
      }
      const param = {
        amount: this.newNumber,
      };
      const data = this.getQuery(param);
      addCarrier(data).then((resp) => {
        if (resp.status == "OK") {
          this.success("新增物流箱成功！");
          this.onLoad();
        }
      });
    },
    onAllowed(val) {
      this.dialogs.ALLOWED.visible = false;
      if (val.success == undefined || val.success == false) {
        return;
      }

      configCarrier(this.allowed).then((resp) => {
        if (resp.status == "OK") {
          this.success("物流箱允入設定成功！");
        }
      });
    },
    onSelectionChange(val) {
      this.selected.carriers = val;
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
    canEdit(row) {
      return (
        row.status == CarrierStatusEnum.Arrive ||
        row.status == CarrierStatusEnum.Remove
      );
    },
    canSelectRow(row, index) {
      return (
        row.status == CarrierStatusEnum.Arrive ||
        row.status == CarrierStatusEnum.Remove
      );
    },
  },
};
</script>
<style scoped>
.el-date-editor--daterange.el-input,
.el-date-editor--daterange.el-input__inner {
  width: 360px;
}
.el-input {
  width: 220px;
}
</style>
