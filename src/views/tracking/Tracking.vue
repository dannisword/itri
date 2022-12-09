<template>
  <el-card class="box-card">
    <el-row>
      <el-col :span="24">
        <el-row>
          <!-- <el-col :span="16">
            <el-select
              v-model="warehouse"
              filterable
              clearable
              placeholder="倉庫"
              @change="changeWarehouse"
            >
              <el-option
                v-for="item in selector.warehouses"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>

          
          </el-col> -->
          <el-col :span="8">
            <el-button type="success" class="btnWidth btnStyle" @click="search">
              reload
            </el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="24">
        <div
          :style="
            'background-image: url(' +
            backgroundImg +
            ');background-repeat: no-repeat; '
          "
        >
          <Diagram
            id="aaaddd"
            :width="1600"
            :height="1200"
            :fluid="false"
            scale="1"
            :nodes="graph.nodes"
            background="#fafafa00"
            @editNode="editNode"
            @editLink="editLink"
            @nodeChanged="nodeChanged"
            @linkChanged="linkChanged"
          ></Diagram>

          <span class="error-msg" v-if="storage == null">查無資料</span>
          <span class="general-msg" v-else>{{ storage }}</span>
        </div>
      </el-col>
      <el-col :span="24">
        <el-table
          :data="positions"
          :default-sort="{ prop: 'carrier', order: 'ascending' }"
          border
          stripe
          class="tableBlock"
          highlight-current-row
          element-loading-text="資料讀取中，請等候..."
          height="250"
        >
          <el-table-column
            label="carrier"
            prop="carrier"
            align="center"
            sortable
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px;">{{ scope.row.carrier }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="location"
            prop="sensor"
            align="center"
            sortable
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px;">{{ scope.row.sensor }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
import Diagram from 'diagram-vue'
import 'diagram-vue/dist/diagram.css'
import { getPositions } from '@/api/carrier'
export default {
  name: 'tracking',
  components: { Diagram },
  data: function () {
    return {
      form: {
        id: 'tracking',
        title: '載具追蹤',
        resource: '載具追蹤',
      },
      isLoading: false,
      utils: null,
      queryForm: {
        soCode: null,
        rfid: null,
        containerNumber: null,
        startDatetime: null,
        endDatetime: null,
        dateTimeRange: null,
        domainId: null,
      },
      carrier: {
        color: '#00FF00E0',
      },
      graph: {},
      storage: '',
      backgroundImg: require('@/assets/layout/layout-All.png'),
      index: 0,
      selector: {
        soCodes: [],
        pallets: [],
        domains: [],
        warehouses: [
          { id: 1, label: '1F', value: '1F' },
          { id: 2, label: '2F', value: '2F' },
        ],
      },
      warehouse: null,
      isShowWarehouse: false,
      locations: [],
      positions: [],
    }
  },
  computed: {},

  watch: {
    warehouse: function () {
      // console.log(this.warehouse);
      if (this.warehouse === '1F') {
        this.backgroundImg = require('@/assets/layout/layout-1F.png')
        // this.backgroundImg = require("@/assets/images/D-warehouse.png");
      } else if (this.warehouse === '2F') {
        this.backgroundImg = require('@/assets/layout/layout-2F.png')
      }
      console.log(this.backgroundImg)
    },
  },

  created: function () {
    console.log('created')
    document.title = localStorage.getItem('title')
    // this.setSelector();
    this.initDatas()
  },

  methods: {
    initDatas() {
      this.showDiagramVue()
      this.search()
    },
    showDiagramVue() {
      console.log('showDiagramVue')
      let data = {
        width: 800,
        height: 600,
        background: '#f0f0f0',
        nodes: [
          // {
          //   id: "175bf57a8ee82bb5",
          //   content: {
          //     text: "A",
          //     color: "#FF0000A0"
          //   },
          //   width: 150,
          //   height: 50,
          //   shape: "rectangle",
          //   point: {
          //     x: 123,
          //     y: 261.7212949036568
          //   }
          // },
          // {
          //   id: "175bf58923c278a2",
          //   content: {
          //     text: "B",
          //     color: this.carrier.color
          //   },
          //   width: 100,
          //   height: 50,
          //   shape: "rectangle",
          //   point: {
          //     x: 10,
          //     y: 116.89091880179991
          //   }
          // }
        ],
        links: [],
      }
      this.graph = data
    },

    showVueDiagrams() {
      const diagramModel = new Diagram.Model()

      const node1 = diagramModel.addNode('test2', 150, 100)
      // const inPort = node1.addInPort("test");

      const node2 = diagramModel.addNode('test', 10, 300, 144, 80)
      // const node2OutPort = node2.addOutPort("testOut");
      // node2.addOutPort("testOut2");
      node2.color = '#00cc66'

      const node3 = diagramModel.addNode('test3', 10, 100, 72, 100)
      // const node3OutPort = node3.addOutPort("testOut3");
      node3.color = '#cc6600'

      // diagramModel.addLink(node2OutPort, inPort);
      // diagramModel.addLink(node3OutPort, inPort);

      this.graph = diagramModel
    },
    search() {
      getPositions()
        .then((respone) => {
          console.log('respone')
          if (respone.status == 'OK') {
            let contents = respone.message
            // console.log(positions);
            // console.log(contents);
            this.deleteAll()
            this.positions = Object.assign([], respone.message)
            let size = contents.length
            for (let i = 0; i < size; i++) {
              let node = contents[i]
              let sensorCode = node.sensor
              let carrierCode = node.carrier
              if (sensorCode.length > 6) {
                sensorCode = 'ASRS'
              }
              // let carrier = node.
              this.showNode(sensorCode, carrierCode)
            }
          } else {
            this.warning(respone.errorMessage)
          }
          this.loading = false
        })
        .catch((e) => {
          this.loading = false
        })
    },

    deleteAll() {
      this.graph.nodes = []

      this.selector = {
        soCodes: [],
        pallets: [],
        domains: [],
        warehouses: [
          { id: 1, label: '1F', value: '1F' },
          { id: 2, label: '2F', value: '2F' },
        ],
      }

      this.storage = ''

      //   this.setSelector();
      this.locations = []
      this.positions = []
    },
    deleteN() {
      let node = {
        id: '1122',
        content: {
          text: 'A*',
          color: '#FF00007a',
        },
        width: 150,
        height: 50,
        shape: 'rectangle',
        point: {
          x: 0,
          y: 0,
        },
      }
      this.deleteNode(node)
    },
    addNode(node) {
      let isAdd = true
      // TODO: 查詢到達此位置的載具編號
      // if (node.id == "BCR131") {
      //   node.content.text = "00003";
      // }
      let size = this.graph.nodes.length
      for (let i = 0; i < size; i++) {
        let element = this.graph.nodes[i]
        if (element.id === node.id) {
          isAdd = false
          break
        }
      }
      if (isAdd) {
        this.graph.nodes.push(node)
      }
    },
    deleteNode(node) {
      let isDelete = false
      let index = 0
      let size = this.graph.nodes.length
      for (let i = 0; i < size; i++) {
        let element = this.graph.nodes[i]
        console.log('element.id', element.id)
        console.log('node.id', node.id)
        if (element.id === node.id) {
          isDelete = true
          index = i
          break
        }
      }
      if (isDelete) {
        this.graph.nodes.splice(index, 1)
      }
    },
    deleteNodeById(nodeId) {
      let isDelete = false
      let index = 0
      let size = this.graph.nodes.length
      for (let i = 0; i < size; i++) {
        let element = this.graph.nodes[i]
        if (element.id === nodeId) {
          isDelete = true
          index = i
          break
        }
      }
      if (isDelete) {
        this.graph.nodes.splice(index, 1)
      }
    },
    editNode(node /* selected node */) {
      /* event handler */
    },
    editLink(link /* selected link */) {
      /* event handler */
    },
    nodeChanged(obj /* array of nodes */) {
      /* event handler */
      const nodes = obj.nodes
    },
    linkChanged(obj /* array of links */) {
      /* event handler */
      const links = obj.links
    },
    changeWarehouse() {
      console.log(this.warehouse)
      this.graph.nodes = []
      this.locations = []
      this.storage = ''
    },
    showNode(nodeName) {
      console.log('nodeName:', nodeName)
      let nodes = this.getSensor()
      let size = nodes.length
      for (let i = 0; i < size; i++) {
        let node = nodes[i]
        if (node.id === nodeName) {
          this.addNode(node)
        }
      }
    },
    showNode(sensorCode, carrierCode) {
      console.log('sensorCode:', sensorCode)
      console.log('carrierCode:', carrierCode)
      let nodes = this.getSensor()

      let size = nodes.length
      for (let i = 0; i < size; i++) {
        let node = nodes[i]
        if (node.id === sensorCode) {
          node.content.text = carrierCode
          this.addNode(node)
        }
      }
    },
    isEmpty: function (value) {
      return value == null || value.length === 0
    },
    getSensor() {
      let nodes = [
        //// STN 101
        {
          id: 'BCR111',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 700,
          },
        },
        {
          id: 'BCR112',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 730,
          },
        },
        {
          id: 'STN101',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 730,
          },
        },
        //// STN102
        {
          id: 'BCR121',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 600,
          },
        },
        {
          id: 'BCR122',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 630,
          },
        },
        {
          id: 'STN102',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 630,
          },
        },
        ////STN103
        {
          id: 'BCR131',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 520,
          },
        },
        {
          id: 'BCR132',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 550,
          },
        },
        {
          id: 'STN103',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 550,
          },
        },
        ////STN104
        {
          id: 'BCR141',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 450,
          },
        },
        {
          id: 'BCR142',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 480,
          },
        },
        {
          id: 'STN104',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 440,
            y: 480,
          },
        },
        //// STN 201
        {
          id: 'BCR211',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 800,
          },
        },
        {
          id: 'BCR214',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 830,
          },
        },
        {
          id: 'STN201',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 830,
          },
        },
        // STN202
        {
          id: 'BCR221',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 720,
          },
        },
        {
          id: 'BCR224',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 750,
          },
        },
        {
          id: 'STN202',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 750,
          },
        },
        //// STN 203
        {
          id: 'BCR231',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 640,
          },
        },
        {
          id: 'BCR234',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 670,
          },
        },
        {
          id: 'STN203',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 670,
          },
        },
        //// STN204
        {
          id: 'BCR241',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 560,
          },
        },
        {
          id: 'BCR244',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 590,
          },
        },
        {
          id: 'STN204',
          content: {
            text: null,
            color: this.carrier.color,
          },
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1295,
            y: 590,
          },
        },
        //// TCR
        {
          id: 'TCR101',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 380,
            y: 800,
          },
        },
        {
          id: 'TCR201',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 1250,
            y: 880,
          },
        },
        ////STL
        {
          id: 'STL103',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 215,
            y: 970,
          },
        },
        {
          id: 'STL102',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 140,
            y: 970,
          },
        },
        {
          id: 'STL101',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 65,
            y: 970,
          },
        },
        {
          id: 'ASRS',
          content: {
            text: null,
            color: this.carrier.color,
          },
          fontSize: 8,
          width: 50,
          height: 20,
          shape: 'rectangle',
          point: {
            x: 150,
            y: 800,
          },
        },
      ]
      return nodes
    },
  },
}
</script>
<style scoped>
.error-msg {
  font-weight: bold;
  color: #ff0000;
  font-size: 16px;
}
.general-msg {
  font-weight: bold;
  font-size: 16px;
}
text {
  font-size: 15px !important;
}
</style>
