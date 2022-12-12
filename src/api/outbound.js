import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A4-1 查詢出庫單(表頭)
 * @returns
 */
export function getOutBounds(params) {
  return request({
    url: `/api/outbound/search${params}`,
    method: "GET",
  });
}
/**
 * A4-2 取得出庫單明細
 * @param {*} outboundId
 * @returns
 */
export function getOutBoundDetail(outboundId) {
  return request({
    url: `/api/outbound/detail/${outboundId}`,
    method: "GET",
  });
}

/**
 * A4-5 執行出庫單(生效)
 * @param {*} docNo
 * @returns
 */
export function startOutbound(docNo) {
  const uri = `/api/outbound/start/${docNo}`;
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
 * A4-10 移至暫存區(取下)
 * @param {*} data
 * @returns
 */
export function takeOutBoundDetail(data) {
  const uri = `/api/outbound/detail/takeOut/`;
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
 * A4-11 回報單據明細出庫資料(編輯/放置完成，回送)
 * @param {*} data
 * @returns
 */
export function setOutBoundDetail(data) {
  const uri = `/api/outbound/detail/`;
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
 * A4-12 結束此單作業
 * @param {*} docNo
 * @returns
 */
export function closeOutbound(docNo) {
  const uri = `/api/outbound/finish/${docNo}`;
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
 * A4-17 收單作業
 * @returns
 */
export function importOutBound() {
  const uri = `/api/outbound/import`;
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
 * A4-18 開工預先叫單
 * @returns
 */
export function preOutBound(isAssign) {
  const uri = `/api/outbound/preInvoke/${isAssign}`;
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
 * A4-19 新增出庫叫單數
 * @param {*} data
 * @returns
 */
export function addOutBound(data) {
  return request({
    url: `/api/outbound/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * A4-20 修改出庫叫單數
 * @param {*} data
 * @returns
 */
export function setOutBound(data) {
  const uri = `/api/outbound/sysParam`;
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
 * A4-21 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getOutBound() {
  return request({
    url: `/api/outbound/sysParam`,
    method: "GET",
  });
}
/**
 * A4-22 空箱叫用
 * @returns
 */
export function getShuttle(carrieNum) {
  return request({
    url: `/api/shuttle/empty/go/${carrieNum}`,
    method: "POST",
  });
}
/**
 * A4-23 取得出庫單(工單/收料單)
 * @param {*} outboundId
 * @returns
 */
export function getOutbound(outboundId) {
  return request({
    url: `/api/outbound/${outboundId}`,
    method: "GET",
  });
}
/**
 * A4-24 查詢空箱出庫進度
 * @param {*} params
 * @returns
 */
export function getEmptyRecords(params) {
  return request({
    url: `/api/outbound/emptyRecord${params}`,
    method: "GET",
  });
}

/**
 * 停止空箱出庫
 * @param {*} station
 * @returns
 */
export function stopOutbound(station) {
  const uri = `/api/shuttle/empty/wait/stop/${station}`;
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
 * A4-27
 * @param {*} docNo 
 * @param {*} carrieId 
 * @returns 
 */
export function callOutbound(docNo, carrieId) {
  return request({
    url: `/api/outbound/detail/${docNo}/${carrieId}`,
    method: "GET",
  });
}