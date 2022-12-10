import router from "./router";
import moment from "moment";
import store from "./store";
import { MessageBox, Message } from "element-ui";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";

import { getUserInfo } from "@/utils/localStorage";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = ["/login"]; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  //NProgress.start();

  // set page title
  //document.title = getPageTitle(to.meta.title);

  // determine whether the user has logged in
  const userInfo = getUserInfo(); //getToken();

  // token 過期時間
  let diff = 0;
  if (userInfo) {
    const day = moment.unix(userInfo.exp).format("YYYY-MM-DD HH:mm");
    diff = moment().diff(day, "hour");
  }

  if (userInfo) {
    //console.log(diff)
    if (to.path === "/login" || diff >= 0) {
      localStorage.clear();
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    // 白名單
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next();
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`);
      //NProgress.done();
    }
  }
});

router.afterEach(() => {
  // finish progress bar
  //NProgress.done();
});
