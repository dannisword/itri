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

/**
 * A1-44 取得單據收單資訊
 * @param {*} docTypeName
 * @returns
 */
export function getReceiveInfo(docTypeName) {
  return request({
    url: `/api/sys/doc/receiveInfo/${docTypeName}`,
    method: "GET",
  });
}



