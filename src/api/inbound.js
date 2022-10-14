import request from "@/utils/request";

/**
 * 收單作業
 * @returns
 */
export function importInBound() {
  return request({
    url: `/api/inbound/import`,
    method: "POST",
  });
}
/**
 * 開工預先叫單
 * @returns
 */
export function preInBound() {
  return request({
    url: `/api/inbound/preInvoke`,
    method: "POST",
  });
}

/**
 * 新增入庫叫單數
 * @param {*} data
 * @returns
 */
export function addInbound(data) {
  return request({
    url: `/api/inbound/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * 修改入庫叫單數
 * @param {*} data
 * @returns
 */
export function setInbound(data) {
  return request({
    url: `/api/inbound/sysParam`,
    method: "PUT",
    data,
  });
}
/**
 * 查詢入庫叫單數
 * @param {*} params
 * @returns
 */
export function getInbounds(params) {
  return request({
    url: `/api/inbound/sysParam`,
    method: "GET",
  });
}
