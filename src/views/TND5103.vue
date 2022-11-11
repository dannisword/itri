<template>
  <div class="app-container">
    <el-form :model="params" label-width="100px" :inline="true">
      <el-form-item label="盤點單號碼">
        <el-input
          v-model="params.prodCode"
          @keyup.enter.native="onLoad()"
        ></el-input>
      </el-form-item>
      <el-form-item label="備註">
        <el-input v-model="memo" @keyup.enter.native="onLoad()"></el-input>
      </el-form-item>
      <el-form-item label="盤點日期">
        <el-date-picker v-model="params.nowDate"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="success" @click="onLoadToday()"
          >選擇今日有異動的料品號</el-button
        >
      </el-form-item>
      <el-divider class="form-divider"></el-divider>
      <el-form-item>
        <el-button type="success" @click="onLoad()">載入代盤點料件</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSave()">儲存盤點單</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="info" @click="onNav('/TND5001')">取消</el-button>
      </el-form-item>
    </el-form>
    <!-- 盤點任務 -->
    <el-table
      :data="content"
      :loading="loading"
      class="table-container"
      border
      stripe
      @selection-change="onCurrentChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>

      <el-table-column label="項次" width="100" prop="seq" fixed>
      </el-table-column>
      <el-table-column label="料品號" prop="prodCode" fixed>
        </el-table-column>
      <el-table-column label="物流箱編號" prop="carrierId" fixed>
      </el-table-column>
      <el-table-column label="儲位編號" prop="stationId"> </el-table-column>
      <el-table-column label="物流箱內數量" prop="closingStock" width="130">
      </el-table-column>
      <el-table-column label="入庫時間" prop="entryDate" width="180">
      </el-table-column>
    </el-table>
    <!-- 今日有異動的物流箱 -->
    <ModalDialog
      :title="dialogs.inv.title"
      :name="dialogs.inv.name"
      :visible.sync="dialogs.inv.visible"
      :optional="Large"
      @afterClosed="onModalClose"
    >
      <el-form :model="params" label-width="100px" :inline="true">
        <el-form-item label="盤點單號碼">
          <el-input
            v-model="params.prodCode"
            @keyup.enter.native="onLoadToday()"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSave(true)">確認</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="info" @click="dialogs.inv.visible = false"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
      <el-table
        :data="changes"
        :loading="loading"
        class="table-container"
        border
        stripe
        @selection-change="onTodayChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column label="項次" width="100" prop="seq" fixed>
        </el-table-column>
        <el-table-column label="料品號" prop="prodCode" fixed>
        </el-table-column>
        <el-table-column label="物流箱編號" prop="carrierId" fixed>
        </el-table-column>
        <el-table-column label="儲位編號" prop="stationId"> </el-table-column>
        <el-table-column label="物流箱內數量" prop="closingStock" width="130">
        </el-table-column>
        <el-table-column label="入庫時間" prop="entryDate" width="180">
        </el-table-column>
      </el-table>
    </ModalDialog>
  </div>
</template>
<script>
import ModalDialog from "@/components/ModalDialog/index.vue";
import pageMixin from "@/utils/mixin";
import {
  getInvAvailables,
  getInvAdjustments,
  setInventories,
} from "@/api/inventory";

export default {
  components: {
    ModalDialog,
  },
  mixins: [pageMixin],
  data() {
    return {
      loading: false,
      memo: "",
      content: [],
      changes: [],
      params: {
        prodCode: "",
        nowDate: "",
      },
      selected: {
        today: [],
        current: [],
      },
      dialogs: {
        inv: {
          title: "選擇今日有異動的物流箱",
          name: "INV",
          visible: false,
        },
      },
    };
  },
  created() {
    this.params.nowDate = this.addDay(0);
    this.Large.showAction = false;
  },
  methods: {
    onLoad() {
      if (this.params.prodCode.length <= 0) {
        this.warning(`請輸入盤點料品號！`);
        return;
      }
      this.loading = true;
      this.content = [];
      getInvAvailables(this.params.prodCode)
        .then((resp) => {
          if (resp.status != "OK") {
            this.warning(`查詢可盤點清單失敗！`);
            return;
          }
          this.content = resp.message;
          this.page.seq = 0;
          for (let item of this.content) {
            this.page.seq++;
            item.seq = this.page.seq;
          }
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    onLoadToday() {
      const query = this.getQuery(this.params);
      this.loading = true;
      getInvAdjustments(query)
        .then((resp) => {
          if (resp.status != "OK") {
            this.warning(`選擇今日有異動的料品號異常！`);
            return;
          }
          // 開窗
          this.dialogs.inv.visible = true;
          this.changes = resp.message;
          this.page.seq = 0;
          for (let item of this.changes) {
            this.page.seq++;
            item.seq = this.page.seq;
          }
          this.loading = false;
        })
        .catch((e) => {
          this.loading = false;
        });
    },
    async onSave(isToday = false) {
      if (this.selected.current.length <= 0 && isToday == false) {
        this.warning(`請選取待盤點料件`);
        return;
      }
      // 當日
      if (this.selected.today.length <= 0 && isToday == true) {
        this.warning(`請選取待盤點料件`);
        return;
      }
      const isConfirm = await this.confirm("是否確定建立盤點單");
      if (isConfirm == false) {
        return;
      }
      const data = {
        ids: [],
        memo: this.memo,
        prodCode: this.params.prodCode,
      };
      // 確認盤點單來源
      if (isToday == false) {
        for (let item of this.selected.current) {
          data.ids.push(item.id);
        }
      } else {
        for (let item of this.selected.today) {
          data.ids.push(item.id);
        }
      }
      // 存檔
      setInventories(data).then((resp) => {
        if (resp.status != "OK") {
          this.warning(`儲存盤點單錯誤!`);
          return;
        }
        this.success("存盤點單成功！");
        this.dialogs.inv.visible = false;
        this.onLoad();
      });
    },
    onCurrentChange(val) {
      this.selected.current = val;
    },
    onTodayChange(val) {
      this.selected.today = val;
    },
    onModalClose(val) {
      if (val.success == undefined || val.success == false) {
        this.dialogs.inv.visible = false;
      }
    },
  },
};
</script>
