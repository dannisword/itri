import request from "@/utils/request";

/**
 * 收單作業
 * @returns
 */
export function importProcess() {
  return request({
    url: `/api/processing/import`,
    method: "POST",
  });
}
/**
 * 開工預先叫單
 * @returns
 */
export function preProcess() {
  return request({
    url: `/api/processing/preInvoke`,
    method: "POST",
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
 * 修改加工叫單數
 * @param {*} data
 * @returns
 */
export function setProcess(data) {
  return request({
    url: `/api/processing/sysParam`,
    method: "PUT",
    data,
  });
}
/**
 * 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getProcesses(params) {
  return request({
    url: `/api/processing/sysParam`,
    method: "GET",
  });
}
