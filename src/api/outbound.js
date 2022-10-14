import request from "@/utils/request";

/**
 * 收單作業
 * @returns
 */
export function importOutBound() {
  return request({
    url: `/api/outbound/import`,
    method: "POST",
  });
}
/**
 * 開工預先叫單
 * @returns
 */
export function preInvoke() {
  return request({
    url: `/api/outbound/preInvoke`,
    method: "POST",
  });
}

/**
 * 新增出庫叫單數
 * @param {*} data
 * @returns
 */
export function addOutbound(data) {
  return request({
    url: `/api/outbound/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * 修改出庫叫單數
 * @param {*} data
 * @returns
 */
export function setOutbound(data) {
  return request({
    url: `/api/outbound/sysParam`,
    method: "PUT",
    data,
  });
}
/**
 * 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getOutbounds(params) {
  return request({
    url: `/api/outbound/sysParam`,
    method: "GET",
  });
}
