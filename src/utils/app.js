import { Message } from "element-ui";
import { getPrivilegeAll } from "@/api/privilege";
/**
 * 回傳訊息
 * @param {*} resp
 * @returns
 */
export function parseBody(resp) {
  return new Promise((resolve, reject) => {
    if (resp.status == "OK") {
      resolve(resp.message);
    } else {
      Message({
        message: "API 格式錯誤",
        type: "error",
        duration: 5000,
      });
      reject();
    }
  });
}
/**
 * 回傳訊息
 * @param {*} respone 
 * @returns 
 */
export function parseMessage(respone) {
  return new Promise((resolve, reject) => {
    try {
      console.log(respone);
      if (!respone.message) {
        warning("回傳格式異常");
        resolve();
      }
      //
      if (respone.message.body) {
        warning(respone.message.body.message);
        resolve();
      }

      if (respone.message.statusCode == "BAD_REQUEST") {
        warning(respone.message.body.message);
        resolve();
      }
    } catch (e) {
      console.log(e);
    }
  });
}

/**
 *
 * @param {*} source
 * @param {*} name
 */
export function appendSelect(source, name = "請選擇") {
  let obj = {};
  if (source.empty == false) {
    obj = clone(source.content[0]);
    for (let [key, value] of Object.entries(obj)) {
      if (typeof value == "number") {
        obj[key] = 0;
      }
      if (typeof value == "string") {
        obj[key] = "";
        if (key == "name") {
          obj[key] = name;
        }
      }
      if (typeof value == "boolean") {
        obj[key] = false;
      }
    }
    source.content.unshift(obj);
  }
}
/**
 * 複製
 * @param {*} obj
 * @returns
 */
export function clone(obj) {
  var data = JSON.stringify(obj);
  return JSON.parse(data);
}
/**
 *
 * @param {*} message
 */
export function success(message) {
  Message({
    message: message,
    type: "success",
    duration: 5000,
  });
}
/**
 *
 * @param {*} message
 */
export function warning(message) {
  Message({
    message: message,
    type: "warning",
    duration: 5000,
  });
}
// icon 圖檔
function getIcon(code) {
  switch (code) {
    case "TND1000":
      return "el-icon-user-solid";
    case "TND2000":
      return "el-icon-download";
    case "TND3000":
      return "el-icon-upload2";
    case "TND4000":
      return "el-icon-help";
    case "TND5000":
      return "el-icon-tickets";
    case "TND6000":
      return "el-icon-search";
    case "TND7000":
      return "el-icon-setting";
    default:
      return "";
  }
}

/**
 * 取得所有權限頁面清單
 */
export async function getPrivileges() {
  const data = await getPrivilegeAll();
  let source = data.message;
  for (let item of source) {
    item.parentCode = Math.floor(item.displaySeq / 1000) * 1000;
    item.level = item.parentCode == item.displaySeq ? 0 : 1;
    item.path = `/${item.code}`;
    item.icon = getIcon(item.code);
  }
  return source;
}

/**
 * 取得選單
 * @returns
 */
export async function getMenus() {
  const source = await getPrivileges();
  // 父選單
  let menus = source.filter((x) => x.level == 0);
  // 子選單
  menus.forEach((elm) => {
    const subs = source.filter(
      (p) => p.parentCode == elm.parentCode && p.level == 1
    );
    elm.hasChilds = subs.length > 0 ? true : false;
    if (elm.hasChilds == true) {
      elm.subs = subs;
    }
  });
  return menus;
}
