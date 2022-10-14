import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A1-3 新增帳號
 * @param {*} user
 * @returns
 */
export function addUser(user) {
  return new Promise((resolve) => {
    request({
      url: `/api/user`,
      method: "POST",
      data: user,
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}
/**
 * A1-4 修改帳號
 * @param {*} userId
 * @param {*} user
 * @returns
 */
export function setUser(userId, user) {
  return new Promise((resolve) => {
    request({
      url: `/api/user/${userId}`,
      method: "PUT",
      data: user,
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}
/**
 * A1-5 修改密碼
 * @param {*} userId
 * @param {*} password
 * @returns
 */
export function changPassword(userId, originalPassword, newPassword) {
  return new Promise((resolve) => {
    request({
      url: `/api/user/password/${userId}`,
      method: "PUT",
      data: {
        originalPassword: originalPassword,
        newPassword: newPassword,
      },
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}
/**
 * A1-6 查詢帳號
 * @param {*} params
 * @returns
 */
export function getUsers(params) {
  return request({
    url: `/api/user/search/${params}`,
    method: "GET",
  });
}
/**
 * A1-7 取得帳號
 * @param {*} userId
 * @returns
 */
export function getUser(userId) {
  return request({
    url: `/api/user/${userId}`,
    method: "GET",
  });
}
/**
 * A1-8 取得左側選單
 * @returns
 */
export function getMenus() {
  return request({
    url: `/api/menus`,
    method: "GET",
  });
}
