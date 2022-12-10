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
// A1-21 取得站點
/**
 * A1-22 查詢站點
 * @returns
 */
export function getWorkStation() {
  return request({
    url: `/api/workStation/search`,
    method: "GET",
  });
}
/**
 * A1-23 切換站點作業模式
 * @param {*} currentModel
 * @returns
 */
export function changeWorkStation(currentModel) {
  return request({
    url: `/api/workStation/model?currentModel=${currentModel}`,
    method: "PUT",
  });
}

/**
 * A1-51, 取得該站點的當前模式下是否有未完成單據
 * @param {*} workStationId
 * @returns
 */
export function getWorkStationIsRun(workStationId) {
  return request({
    url: `/api/workStation/isUnfinished/${workStationId}`,
    method: "GET",
  });
}
