import request from "@/utils/request";

/**
 * 新增物流箱
 * @param {*} data
 * @returns
 */
export function addCarrier(data) {
  return request({
    url: `/api/carrier`,
    method: "POST",
    data,
  });
}
/**
 * 物流箱允入設定
 * @param {*} data
 * @returns
 */
export function configCarrier(data) {
  return request({
    url: `/api/carrier/config`,
    method: "PUT",
    data,
  });
}
/**
 * 設定多筆物流箱啟用/停用
 * @param {*} data
 * @returns
 */
export function setCarriers(data) {
  return request({
    url: `/api/carrier/isEnable`,
    method: "POST",
    data,
  });
}
/**
 * 設定物流箱啟用/停用
 * @param {*} id
 * @param {*} data
 * @returns
 */
export function setCarrier(id, data) {
  return request({
    url: `/api/carrier/isEnable/${id}`,
    method: "POST",
    data,
  });
}
/**
 * 取得特定物流箱
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
 * 查詢物流箱
 * @param {*} params
 * @returns
 */
export function getCarriers(params) {
  return request({
    url: `/api/carrier/search`,
    method: "POST",
    params,
  });
}
