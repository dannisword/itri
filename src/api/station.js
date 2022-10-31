import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A2-4 設定儲位狀態
 * @param {*} storageId
 * @param {*} data
 * @returns
 */
export function setStation(storageId, data) {
  const uri = `/api/station/status/${storageId}`;
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
 * A2-5, 批次設定儲位狀態(批次更新狀態)
 * @param {*} checkOnLock
 * @returns
 */
export function setBatch(checkOnLock, data) {
  const uri = `/api/station/patch/status/${checkOnLock}`;
  const method = "PUT";
  return new Promise((resolve) => {
    request({
      url: uri,
      method: method,
      data,
    }).then((resp) => {
      resolve(resp);
    });
  });
}

/**
 * https://www.logistics.org.tw/tenacity/api/station/range/status/true?aisle=2&level=1&status=0
 * https://www.logistics.org.tw/tenacity/api/station/range/status/true?aisle=2&level=1
 * @param {*} checkOnLock 
 * @param {*} data 
 * @returns 
 */
export function setRange(checkOnLock, data) {
  const uri = `api/station/range/status/${checkOnLock}${data}`;
  const method = "PUT";
  return new Promise((resolve) => {
    request({
      url: uri,
      method: method,
    }).then((resp) => {
      resolve(resp);
    });
  });
}

/**
 * A2-8 查詢儲位
 * @param {*} params
 * @returns
 */
export function getStations(params) {
  return request({
    url: `/api/station/search${params}`,
    method: "GET",
  });
}

/**
 *  A1-11 簽入人員(今日簽入作業)
 * @param {*} data
 * @returns
 */
export function setSignIn(data) {
  return request({
    url: `/api/auth/signIn`,
    method: "POST",
    data,
  });
}

/**
 *  A1-12 簽出人員(今日簽出作業)
 * @param {*} data
 * @returns
 */
export function setSignOut(data) {
  return request({
    url: `/api/auth/signOut`,
    method: "POST",
    data,
  });
}

/**
 * A1-13 查詢簽到記錄
 * @param {*} params
 * @returns
 */
export function getSignRecord(params) {
  return request({
    url: `/api/signRecord/search${params}`,
    method: "GET",
  });
}

/**
 * A1-14 查詢簽到統計記錄
 * @param {*} params
 * @returns
 */
export function getSignStatistics(params) {
  return request({
    url: `/api/signStatisticsRecord/search${params}`,
    method: "GET",
  });
}

/**
 * A1-15 查詢站別人員名單
 * @param {*} params
 * @returns
 */
export function getEmployees(params) {
  return request({
    url: `/api/station/employee/search${params}`,
    method: "GET",
  });
}
/**
 * A1-16 設定站別人員名單
 * @param {*} data
 * @returns
 */
export function setEmployees(data) {
  return request({
    url: `/api/station/employee/search`,
    method: "POST",
    data,
  });
}
