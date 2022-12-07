import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A5-1 收單作業
 * @returns
 */
export function importProcess() {
  const uri = `/api/processing/import`;
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
 * A5-2 開工預先叫單
 * @returns
 */
export function preProcess(isAssign) {
  const uri = `/api/processing/preInvoke/${isAssign}`;
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
export function addProcess(data) {
  return request({
    url: `/api/processing/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * A5-4 修改加工叫單數
 * @param {*} data
 * @returns
 */
export function setProcess(data) {
  const uri = `/api/processing/sysParam`;
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
 * A5-5 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getProcess() {
  return request({
    url: `/api/processing/sysParam`,
    method: "GET",
  });
}

/**
 * A5-6 分頁查詢加工單
 * @param {*} params
 * @returns
 */
export function getProcesses(params) {
  return request({
    url: `/api/processing/search${params}`,
    method: "GET",
  });
}

/**
 * A5-27 取得操作單號的下拉選單選項
 * @returns 
 */
export function getProcessDocOption() {
  return request({
    url: `/api/processing/processDocOption`,
    method: "GET",
  });
}
