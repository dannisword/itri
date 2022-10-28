import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

///api/station/search
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
