import request from "@/utils/request";
import { parseMessage } from "@/utils/app";
///api/inbound/detail/{inboundId}
/**
 * A3-01 取得所有入庫單明細
 * @param {*} inboundId
 * @returns
 */
export function getInboundDetail(inboundId) {
  return request({
    url: `api/inbound/detail/${inboundId}`,
    method: "GET",
  });
}

/**
 * A3-3 查詢入庫單(工單/收料單)
 * @param {*} params
 * @returns
 */
export function getInbounds(params) {
  return request({
    url: `/api/inbound/search${params}`,
    method: "GET",
  });
}
/**
 * A3-6 回報單據明細入庫資料
 * @param {*} data
 * @returns
 */
export function setInboundDetail(data) {
  return request({
    url: `api/inbound/detail`,
    method: "PUT",
    data,
  });
}

/**
 * A3-7 結束此單作業
 * @param {*} carrierId
 * @returns
 */
export function closeInbound(docNo) {
  return request({
    url: `/api/inbound/finish/${docNo}`,
    method: "POST",
  });
}

/**
 * A3-8 空箱入庫
 * @returns
 */
export function setShuttle(carrierId) {
  return request({
    url: `/api/shuttle/empty/pull/${carrierId}`,
    method: "POST",
  });
}
/**
 * A3-10 查詢空箱入庫進度
 * @param {*} params
 * @returns
 */
export function getEmptyRecords(params) {
  return request({
    url: `/api/inbound/emptyRecord${params}`,
    method: "GET",
  });
}
/**
 * A3-11 收單作業
 * @returns
 */
export function importInBound() {
  const uri = `/api/inbound/import`;
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
 * A3-12 開工預先叫單
 * @returns
 */
export function preInBound(isAssign) {
  const uri = `/api/inbound/preInvoke/${isAssign}`;
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
 * A3-13 新增入庫叫單數
 * @param {*} data
 * @returns
 */
export function addInbound(data) {
  return request({
    url: `/api/inbound/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * A3-14 修改入庫叫單數
 * @param {*} data
 * @returns
 */
export function setInbound(data) {
  const uri = `/api/inbound/sysParam`;
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
 * A3-15 查詢入庫叫單數
 * @param {*} params
 * @returns
 */
export function getInboundParam() {
  return request({
    url: `/api/inbound/sysParam`,
    method: "GET",
  });
}

/**
 * A3-16 取得入庫工作
 * @param {*} inboundId
 * @returns
 */
export function getInbound(inboundId) {
  return request({
    url: `/api/inbound/${inboundId}`,
    method: "GET",
  });
}

/**
 * A3-18 查詢單據照片
 * @param {*} docNo
 * @returns
 */
export function getInboundImage(docNo) {
  return request({
    url: `/api/inbound/getInboundImage/${docNo}`,
    method: "GET",
  });
}

/**
 * A3-19 刪除出庫單明細
 * @param {*} docNo
 * @param {*} carrieId
 * @returns
 */
export function deleteInboundDetail(docNo, carrieId) {
  const uri = `/api/inbound/deleteDetail/${docNo}/${carrieId}`;
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
