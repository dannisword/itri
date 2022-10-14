import request from "@/utils/request";
import { Message } from "element-ui";
import { appendSelect, parseBody, parseMessage } from "@/utils/app";

/**
 * A1-24 新增角色
 * @param {*} user
 * @returns
 */
export function addRole(data) {
  return new Promise((resolve) => {
    request({
      url: `/api/role`,
      method: "POST",
      data,
    }).then((res) => {
      parseMessage(res);
      resolve(res);
    });
  });
}
/**
 * A1-25 修改角色
 * @param {*} roleId
 * @param {*} role
 * @returns
 */
export function setRole(roleId, data) {
  return new Promise((resolve) => {
    request({
      url: `/api/role/${roleId}`,
      method: "PUT",
      data,
    }).then((res) => {
      parseMessage(res);
      resolve(res);
    });
  });
}
/**
 * A1-26 刪除角色
 * @param {*} roleId
 * @returns
 */
export function deleteRole(roleId) {
  return request({
    url: `/api/role/${roleId}`,
    method: "DELETE",
  });
}
/**
 * A1-27 取得角色
 * @param {*} roleId
 * @returns
 */
export function getRole(roleId) {
  return request({
    url: `/api/role/${roleId}`,
    method: "GET",
  });
}
/**
 * A1-28 查詢角色
 * @param {*} params
 * @returns
 */
export function getRoles(params) {
  let isSelect = false;
  // 下拉選單
  return new Promise((resolve) => {
    if (!params) {
      params = "?direction=ASC&isEnable=true&properties=id";
      isSelect = true;
    }

    request({
      url: `/api/role/search${params}`,
      method: "GET",
    }).then(async (res) => {
      let data = await parseBody(res);
      // 下拉選單
      if (isSelect == true) {
        appendSelect(data);
      } else {
      }
      resolve(data);
    });
  });
}
