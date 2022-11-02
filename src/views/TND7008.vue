<template>
  <div class="app-container">
    <div class="form-container">
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
          <el-select v-model="params.status" placeholder="請選擇">
            <el-option
              v-for="item in carrierStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="狀態">
          <el-select v-model="params.isEnable" placeholder="請選擇">
            <el-option
              v-for="item in enabledTyps"
              :key="item.value"
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
        <el-button type="info" @click="onLoad()">物流箱歷程查詢</el-button>
      </el-col>
      <el-col :span="8" align="end">
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
    <!-- 資料表 -->
    <el-table
      :data="carriers"
      class="table-container"
      border
      stripe
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="物流箱編號" width="100" prop="id" fixed>
      </el-table-column>
      <el-table-column label="建立日期" width="180" prop="createTime">
      </el-table-column>
      <el-table-column label="建立人員" width="100" prop="creator">
      </el-table-column>
      <el-table-column label="物流箱動作" width="100" prop="statusName">
      </el-table-column>
      <el-table-column label="狀態" width="100" prop="isEnable">
        <template slot-scope="scope">
          <span>{{ scope.row.isEnable | formatEnable() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品料號" prop="materialNo"> </el-table-column>
      <el-table-column label="所在儲位/站點" width="180" prop="stationCode">
      </el-table-column>

      <el-table-column label="編輯狀態" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="onEdit(scope.row)"
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
              :key="item.value"
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
import { SelectTypeEnum } from "@/utils/enums/index";
import {
  getCarriers,
  addCarrier,
  configCarrier,
  enableCarrier,
  enableCarriers,
  printBarcode,
} from "@/api/carrier";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
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
        size: 10,
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
    this.nowDate.push(this.addDay(-1));
    this.nowDate.push(this.addDay(0));
    // 物流箱動作
    getSelector(SelectTypeEnum.CARRIER_STATUS).then((resp) => {
      this.carrierStatus = resp.message;
    });
    // 狀態
    getSelector(SelectTypeEnum.ENABLED_TYPE).then((resp) => {
      this.enabledTyps = resp.message;
    });
  },
  methods: {
    onLoad() {
      this.params.startDate = this.toDate(this.nowDate[0]);
      this.params.endDate = this.toDate(this.nowDate[1]);
      const query = this.getQuery(this.params);

      getCarriers(query).then((resp) => {
        if (resp.status == "OK") {
          this.carriers = resp.message.content;
          // 項次
          const pageable = resp.message.pageable;
          let index = this.getIndex(pageable);
          this.carriers.forEach((elm) => {
            elm.seq = index;
            index++;
          });
        }
      });
    },
    onOpenModal(val) {
      if (val == "NEW") {
        this.newNumber = 0;
        this.dialogs.NEW.visible = true;
      }

      if (val == "ALLOWED") {
        this.dialogs.ALLOWED.visible = true;
      }

      if (val == "BATCH") {
        if (this.selected.carriers.length <= 0) {
          this.warning("請選取批次更新物流箱");
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
      if (val.success == undefined) {
        this.dialogs.BATCH.visible = true;
        return;
      }
      this.dialogs.BATCH.visible = false;
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
        this.warning("請選取需列印物流箱！");
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
      if (val.success == false) {
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
      if (val.success == false) {
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
    onSizeChange(val) {},
    onCurrentChange(val) {},
  },
};
</script>
<style scoped>
.el-date-editor--daterange.el-input,
.el-date-editor--daterange.el-input__inner {
  width: 360px;
}
</style>
