import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A7-1 建立盤點單
 * @param {*} data 
 * @returns 
 */
export function setInventories(data) {
  const uri = `/api/inventory`;
  const method = "POST";
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
 * A7-02 執行盤點單(生效)
 * @param {*} docNo
 * @returns
 */
export function setInvEffect(docNo) {
  const uri = `/api/inventory/start/${docNo}`;
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
 * A7-03 修改盤點單狀態
 * @param {*} docNo
 * @param {*} status
 * @returns
 */
export function setInvInvalid(docNo, status) {
  const uri = `/api/inventory/start/${docNo}/${status}`;
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

/**
 * A7-23 查詢可盤點清單
 * @param {*} prodCode
 * @returns
 */
export function getInvAdjustments(prodCode) {
  return request({
    url: `/api/inventory/stock/adjustment/search${prodCode}`,
    method: "GET",
  });
}

/**
 * A7-24 查詢可盤點清單
 * @param {*} prodCode
 * @returns
 */
export function getInvAvailables(prodCode) {
  return request({
    url: `/api/inventory/available/search?prodCode=${prodCode}`,
    method: "GET",
  });
}
