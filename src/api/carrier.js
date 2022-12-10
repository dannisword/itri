import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A2-10 新增物流箱
 * @param {*} data
 * @returns
 */
export function addCarrier(data) {
  const uri = `/api/carrier${data}`;
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
 * A2-11 物流箱允入設定
 * @param {*} data
 * @returns
 */
export function configCarrier(data) {
  const uri = `/api/carrier/config`;
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
 * A2-12 設定多筆物流箱啟用/停用
 * @param {*} data
 * @returns
 */
export function enableCarriers(checkOnWork, data) {
  const uri = `/api/carrier/patch/isEnable/${checkOnWork}`;
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
 * A2-13 設定物流箱啟用/停用
 * @param {*} id
 * @param {*} data
 * @returns
 */
export function enableCarrier(id, isEnable) {
  const uri = `/api/carrier/isEnable/${id}?isEnable=${isEnable}`;
  const method = "PUT";

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
 * A2-14 取得特定物流箱
 * @param {*} id
 * @returns
 */
export function getCarrier(id) {
  return request({
    url: `/api/carrier/${id}`,
    method: "GET",
  });
}
/**
 * A2-15 查詢物流箱
 * @param {*} params
 * @returns
 */
export function getCarriers(params) {
  return request({
    url: `/api/carrier/search${params}`,
    method: "GET",
  });
}
/**
 * A2-16, 列印物流箱編號
 * @param {*} id
 * @param {*} isEnable
 * @returns
 */
export function printBarcode(data) {
  const uri = `/api/carrier/barcode`;
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
 * A2-17, 取得空箱數量
 * @returns 
 */
export function getEmptyCount() {
  return request({
    url: `/api/carrier/emptyCount`,
    method: "GET",
  });
}
/**
 * A2-19, 取得物流箱允入條件
 * @returns
 */
export function getCarrierConfig() {
  return request({
    url: `/api/carrier/config`,
    method: "GET",
  });
}

/**
 * A2-20 取得物流箱歷程
 * @param {*} params
 * @returns
 */
export function getShuttles(params) {
  return request({
    url: `/api/carrier/callBackLog${params}`,
    method: "GET",
  });
}


/**
 * 物流箱到站
 * @param {*} data 
 * @returns 
 */
export function carrierCallback(data){
  const uri = `/device/carrierCallback`;
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
 * 
 * @returns 
 */
export function getPositions() {
  return request({
    url: `/api/carrier/position`,
    method: "GET",
  });
}

