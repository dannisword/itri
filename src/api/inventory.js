import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

// /api/inventory/search
/**
 * A7-6 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getInventories(params) {
  return request({
    url: `/api/inventory/search${params}`,
    method: "GET",
  });
}

/**
 * A7-17 收單作業
 * @returns
 */
export function importInventory() {
  const uri = `/api/inventory/import`;
  const method = "POST";
  return new Promise((resolve) => {
    request({
      url: uri,
      method: method,
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}
/**
 * A7-18 開工預先叫單
 * @returns
 */
export function preInventory(isAssign) {
  const uri = `/api/inventory/preInvoke/${isAssign}`;
  const method = "POST";
  return new Promise((resolve) => {
    request({
      url: uri,
      method: method,
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}

/**
 * 新增加工叫單數
 * @param {*} data
 * @returns
 */
export function addInventory(data) {
  return request({
    url: `/api/inventory/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * A7-20 修改加工叫單數
 * @param {*} data
 * @returns
 */
export function setInventory(data) {
  const uri = `/api/inventory/sysParam`;
  const method = "PUT";
  return new Promise((resolve) => {
    request({
      url: uri,
      method: method,
      data,
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}
/**
 * A7-21 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getInventorie() {
  return request({
    url: `/api/inventory/sysParam`,
    method: "GET",
  });
}
