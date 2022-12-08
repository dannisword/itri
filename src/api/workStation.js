import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A1-19 批次修改站點
 * @param {*} data 
 * @returns 
 */
export function setWorkStations(data) {
  return new Promise((resolve) => {
    request({
      url: `/api/workStation/batch`,
      method: "PUT",
      data,
    }).then((respone) => {
      parseMessage(respone);
      resolve(respone);
    });
  });
}
/**
 * A1-22 查詢站點
 * @returns 
 */
export function getWorkStationa() {
  return request({
    url: `/api/workStation/search`,
    method: "GET",
  });
}


export function getWorkStation() {
  return request({
    url: `/api/workStation/search`,
    method: "GET",
  });
}