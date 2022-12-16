import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";

export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/Login"),
    hidden: true,
  },

  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },

  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "Dashboard" },
      },
      {
        path: "/TND1000",
        name: "TND1000",
        component: () => import("@/views/TND1000"),
        meta: { title: "簽入/簽出" },
      },
      {
        path: "/TND2001",
        name: "TND2001",
        component: () => import("@/views/TND2001"),
        meta: { title: "入庫工作" },
      },
      {
        path: "/TND2002",
        name: "TND2002",
        component: () => import("@/views/TND2002"),
        meta: { title: "空箱入庫" },
      },
      {
        path: "/TND2100/:id",
        name: "TND2100",
        component: () => import("@/views/TND2100"),
        meta: { title: "執行入庫工作" },
      },
      
      {
        path: "/TND3001",
        name: "TND3001",
        component: () => import("@/views/TND3001"),
        meta: { title: "出庫工作" },
      },
      {
        path: "/TND3002",
        name: "TND3002",
        component: () => import("@/views/TND3002"),
        meta: { title: "空箱出庫" },
      },
      {
        path: "/TND3100/:id",
        name: "TND3100",
        component: () => import("@/views/TND3100"),
        meta: { title: "執行出庫工作" },
      },
      {
        path: "/TND4001",
        name: "TND4001",
        component: () => import("@/views/TND4001"),
        meta: { title: "加工工作" },
      },
      {
        path: "/TND4100/:id",
        name: "TND4100",
        component: () => import("@/views/TND4100"),
        meta: { title: "執行加工工作" },
      },
      {
        path: "/TND5001",
        name: "TND5001",
        component: () => import("@/views/TND5001"),
        meta: { title: "盤點工作" },
      },
      {
        path: "/TND5002",
        name: "TND5002",
        component: () => import("@/views/TND5002"),
        meta: { title: "庫存異動工作" },
      },
      {
        path: "/TND5100/:type/:id",
        name: "TND5100",
        component: () => import("@/views/TND5100"),
        meta: { title: "執行盤點工作-初盤" },
      },
      {
        path: "/TND5101/:type/:id",
        name: "TND5101",
        component: () => import("@/views/TND5100"),
        meta: { title: "執行盤點工作-已完成有盤差" },
      },
      {
        path: "/TND5102/:type/:id",
        name: "TND5102",
        component: () => import("@/views/TND5100"),
        meta: { title: "執行盤點工作-複盤" },
      },
      {
        path: "/TND5103",
        name: "TND5103",
        component: () => import("@/views/TND5103"),
        meta: { title: "新增盤點任務" },
      },
      {
        path: "/TND6000",
        name: "TND6000",
        component: () => import("@/views/TND6000"),
        meta: { title: "庫存查詢" },
      },
      {
        path: "/TND7001",
        name: "TND7001",
        component: () => import("@/views/TND7001"),
        meta: { title: "入庫開工設定" },
      },
      {
        path: "/TND7002",
        name: "TND7002",
        component: () => import("@/views/TND7002"),
        meta: { title: "出庫開工設定" },
      },
      {
        path: "/TND7003",
        name: "TND700",
        component: () => import("@/views/TND7003"),
        meta: { title: "加工開工設定" },
      },
      {
        path: "/TND7004",
        name: "TND7004",
        component: () => import("@/views/TND7004"),
        meta: { title: "盤點開工設定" },
      },
      {
        path: "/TND7005",
        name: "TND7005",
        component: () => import("@/views/TND7005"),
        meta: { title: "個人帳號管理" },
      },
      {
        path: "/TND7006",
        name: "TND7006",
        component: () => import("@/views/TND7006"),
        meta: { title: "站點管理" },
      },
      {
        path: "/TND7007",
        name: "TND7007",
        component: () => import("@/views/TND7007"),
        meta: { title: "儲位管理" },
      },
      {
        path: "/TND7008",
        name: "TND7008",
        component: () => import("@/views/TND7008"),
        meta: { title: "物流箱管理" },
      },
      {
        path: "/TND7009",
        name: "TND7009",
        component: () => import("@/views/TND7009"),
        meta: { title: "使用者帳號管理" },
      },
      {
        path: "/TND7010",
        name: "TND7010",
        component: () => import("@/views/TND7010"),
        meta: { title: "角色權限設定" },
      },
      {
        path: "/TND7011",
        name: "TND7011",
        component: () => import("@/views/TND7011"),
        meta: { title: "物流箱歷程查詢" },
      },
      {
        path: "/Tracking",
        name: "Tracking",
        component: () => import("@/views/tracking/Tracking"),
        meta: { title: "Tracking" },
      },
    ],
  },
  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    // mode: "history", // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes,
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
