import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A4-1 查詢出庫單(表頭)
 * @returns 
 */
export function getOutBounds() {
  return request({
    url: `/api/outbound/search`,
    method: "GET",
  });
}


/**
 * A4-17 收單作業
 * @returns
 */
export function importOutBound() {
  const uri = `/api/outbound/import`;
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
 * A4-18 開工預先叫單
 * @returns
 */
export function preOutBound(isAssign) {
  const uri = `/api/outbound/preInvoke/${isAssign}`;
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
 * 新增出庫叫單數
 * @param {*} data
 * @returns
 */
export function addOutBound(data) {
  return request({
    url: `/api/outbound/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * A4-20 修改出庫叫單數
 * @param {*} data
 * @returns
 */
export function setOutBound(data) {
  const uri = `/api/outbound/sysParam`;
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
 * A4-21 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getOutBound() {
  return request({
    url: `/api/outbound/sysParam`,
    method: "GET",
  });
}
