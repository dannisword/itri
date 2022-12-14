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
          <el-button type="warning" @click="onOpenModal('NEW')">
            新增物流箱
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="onOpenModal('ALLOWED')">
            物流箱允入設定
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 功能鍵及分頁-->
    <el-row type="flex" class="mt-1">
      <el-col :span="14">
        <el-button type="primary" @click="onPrint()">列印勾選項目</el-button>
        <el-button type="success" @click="onOpenModal('BATCH')"
          >批次更新狀態</el-button
        >
        <el-button type="info" @click="onNav('/TND7011')">
          物流箱歷程查詢
        </el-button>
      </el-col>
      <el-col :span="10" align="end">
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

    <!-- 列印物流箱 -->
    <ModalDialog
      :title="dialogs.PRINT.title"
      :name="dialogs.PRINT.name"
      :visible.sync="dialogs.PRINT.visible"
      :optional="dialogs.PRINT.optional"
      @afterClosed="onModalClose"
    >
      <h3>您確定要列印 {{ newCarriers.length }} 個物流箱</h3>
      <el-row class="mt-1">
        <el-button type="primary" @click="onNewPrint(1)">
          確定，列印物流箱編號
        </el-button>
      </el-row>
      <el-row class="mt-1">
        <el-button type="primary" @click="onNewPrint(0)">
          確定，不列印物流箱編號
        </el-button>
      </el-row>
      <el-row class="mt-1">
        <el-button type="info" @click="onNewPrint(0)"> 取消 </el-button>
      </el-row>
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
            step="0.01"
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
    </ModalDialog>
  </div>
</template>
<script>
import moment from "moment";
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import { getToken } from "@/utils/localStorage";
import { getSelector } from "@/api/system";
import { SelectTypeEnum, CarrierStatusEnum } from "@/utils/enums/index";
import {
  getCarriers,
  getCarrier,
  addCarrier,
  configCarrier,
  enableCarrier,
  enableCarriers,
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
      newCarriers: [],
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
        isEnable: [],
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
        PRINT: {
          title: "列印物流箱條碼",
          name: "PRINT",
          visible: false,
          optional: {
            size: "Small",
            showAction: false,
          },
        },
      },
      newNumber: 0,
    };
  },
  created() {
    //this.nowDate.push(this.addDay(-30));
    //this.nowDate.push(this.addDay(0));
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
      
      if (this.nowDate[0] != null) {
        this.params.startDate = this.toDate(this.nowDate[0]);
        this.params.endDate = this.toDate(this.nowDate[1]);
      }
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
        getCarrierConfig().then((resp) => {
          if (resp.status == "OK") {
            this.allowed = resp.message;
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
      getCarrier(val.id).then((resp) => {
        if (resp.status == "OK") {
          this.carrier = resp.message;
          this.dialogs.EDIT.visible = true;
        } else {
          this.warning("編輯物流箱異常！");
        }
      });
    },
    onSave(val) {
      this.dialogs.EDIT.visible = false;
      if (val.success == undefined || val.success == false) {
        this.onLoad();
        return;
      }
      // 0: 已達儲位、 5: 取下
      if (
        this.carrier.status == CarrierStatusEnum.ALLOWED ||
        this.carrier.status == CarrierStatusEnum.Remove
      ) {
        // 存檔
        enableCarrier(this.carrier.id, this.carrier.isEnable).then((resp) => {
          if (resp.status == "OK") {
            this.success("編輯物流箱成功！");
            this.onLoad();
          }
        });
      } else {
        this.warning(`物流箱狀態已為${val.statusName}，不可編輯`);
      }
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
    onModalClose(val) {
      if (val.success == undefined) {
        this.dialogs.PRINT.visible = false;
      }
    },
    onNewPrint(val) {
      this.dialogs.PRINT.visible = false;
      // 列印條碼
      const data = [];
      if (val == 1) {
        for (let item of this.newCarriers) {
          data.push({
            id: item,
            printCounts: 1,
          });
        }
        this.printBarcode(data);
      }
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
      this.printBarcode(data);
    },
    printBarcode(data) {
      console.log(data)
      // 下載檔案
      const url = process.env.VUE_APP_BASE_API + "/api/carrier/barcode";
      const config = {
        Authorization: getToken(),
        "Content-Type": "application/json",
      };

      fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: config,
        responseType: "blob",
      })
        .then((response) => {
          if (response.ok) {
            return response.blob();
          }
        })
        .then((blob) => {
          const file = moment().format("YYYYMMDDHHmmss");
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = file;
          link.click();
          URL.revokeObjectURL(link.href);
        });
    },
    blobToFile(theBlob, fileName) {
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      theBlob.lastModifiedDate = new Date();
      theBlob.name = fileName;
      return theBlob;
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
        if (resp.title == "successful") {
          this.success("新增物流箱成功！");
          // TODO 列印提示
          this.newCarriers = resp.message.carrierIds;
          console.log(this.newCarriers)
          this.dialogs.PRINT.visible = true;
          this.onLoad();
        }
      });
    },
    onAllowed(val) {
      this.dialogs.ALLOWED.visible = false;
      if (val.success == undefined || val.success == false) {
        return;
      }
      // 轉型
      this.allowed.weightLimit = parseFloat(this.allowed.weightLimit);
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
