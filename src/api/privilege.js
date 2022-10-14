import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A1-29 新增權限頁面
 * @param {*} data
 * @returns
 */
export function addPrivilege(data) {
  return request({
    url: `/api/privilege`,
    method: "POST",
    data,
  });
}
/**
 * A1-30 修改權限頁面
 * @param {*} id
 * @param {*} data
 * @returns
 */
export function setPrivilege(id, data) {
  return request({
    url: `/api/privilege/${id}`,
    method: "POST",
    data,
  });
}
/**
 * A1-31 刪除權限頁面
 * @param {*} id
 * @returns
 */
export function deletePrivilege(id) {
  return request({
    url: `/api/privilege/${id}`,
    method: "DELETE",
    data,
  });
}
/**
 * A1-32 取得權限頁面
 * @param {*} id
 * @returns
 */
export function getPrivilege(id) {
  return request({
    url: `/api/privilege/${id}`,
    method: "GET",
  });
}
/**
 * A1-33 取得權限頁面
 * @param {*} params
 * @returns
 */
export function getPrivileges(params) {
  return request({
    url: `/api/privilege/search/${params}`,
    method: "GET",
  });
}
/**
 * ? 取得所有權限頁面清單
 * @returns 
 */
export function getPrivilegeAll() {
  return request({
    url: `/api/privilege/list`,
    method: "GET",
  });
}
/**
 * A1-34 修改角色權限對應
 * @param {*} roleId
 * @param {*} data
 * @returns
 */
export function setRolePrivilege(roleId, data) {
  return new Promise((resolve) => {
    request({
      url: `/api/role/privilege/${roleId}`,
      method: "PUT",
      data,
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}
/**
 * A1-35 取得角色權限對應
 * @param {*} roleId
 * @returns
 */
export function getRolePrivilege(roleId) {
  return request({
    url: `/api/role/privilege/${roleId}`,
    method: "GET",
  });
}
