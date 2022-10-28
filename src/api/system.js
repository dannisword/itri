import request from "@/utils/request";

/**
 * A1-41 取得下拉選單
 * @param {*} type
 * @returns
 */
export function getSelector(type) {
  return request({
    url: `/api/sysParam/selector/${type}`,
    method: "GET",
  });
}


