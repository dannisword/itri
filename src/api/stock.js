import request from "@/utils/request";
import { parseMessage } from "@/utils/app";
/**
 * A6-1, 查詢庫存資訊
 * @param {*} params
 * @returns
 */
export function getStocks(params) {
  return request({
    url: `/api/stock/search/${params}`,
    method: "GET",
  });
}
