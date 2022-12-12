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

/**
 * A1-46 取得物流箱進度(分子分母)
 * @param {*} docNo 
 * @param {*} docType 
 * @returns 
 */
export function carrierArrived(docNo, docType){
  return request({
    url: `/api/sys/carrierArrived/${docNo}/${docType}`,
    method: "GET",
  });
}


/**
 * A1-47 查詢物流箱進度
 * @param {*} params 
 * @returns 
 */
export function getCarrierArrived(params){
  return request({
    url: `/api/sys/doc/carrierArrived${params}`,
    method: "GET",
  });
}

