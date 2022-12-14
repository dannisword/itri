import request from "@/utils/request";
import { parseMessage } from "@/utils/app";

/**
 * A5-1 收單作業
 * @returns
 */
export function importProcess() {
  const uri = `/api/processing/import`;
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
 * A5-2 開工預先叫單
 * @returns
 */
export function preProcess(isAssign) {
  const uri = `/api/processing/preInvoke/${isAssign}`;
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
 * 新增加工叫單數
 * @param {*} data
 * @returns
 */
export function addProcess(data) {
  return request({
    url: `/api/processing/sysParam`,
    method: "POST",
    data,
  });
}
/**
 * A5-4 修改加工叫單數
 * @param {*} data
 * @returns
 */
export function setProcess(data) {
  const uri = `/api/processing/sysParam`;
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
 * A5-5 查詢出庫叫單數
 * @param {*} params
 * @returns
 */
export function getProcess() {
  return request({
    url: `/api/processing/sysParam`,
    method: "GET",
  });
}

/**
 * A5-6 分頁查詢加工單
 * @param {*} params
 * @returns
 */
export function getProcesses(params) {
  return request({
    url: `/api/processing/search${params}`,
    method: "GET",
  });
}

/**
 * A5-7 取得加工單表頭與所有明細
 * @param {*} processingId
 * @returns
 */
export function getProcessDetails(processingId) {
  return request({
    url: `/api/processing/detail/${processingId}`,
    method: "GET",
  });
}
// A5-8

// A5-8

/**
 * A5-10 執行加工單
 * @param {*} docNo
 * @returns
 */
export function startProcess(docNo) {
  const uri = `/api/processing/start/${docNo}`;
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
 * A5-13 取得未完成的單據數量
 * @param {*} workStationId
 * @returns
 */
export function getProcessTodo(workStationId) {
  return request({
    url: `/api/processing/todoCount/${workStationId}`,
    method: "GET",
  });
}
/**
 * A5-15 移至暫存區(取下)
 * @param {*} data
 * @returns
 */
export function takeProcessingDetail(data) {
  const uri = `/api/processing/detail/takeOut`;
  const method = "POST";

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
 * A5-16 PUT 回報單據明細資料(放置完成，回送)
 * @param {*} data
 * @returns
 */
export function setSourceDetail(data) {
  const uri = `/api/processing/pickingDetail/${data.isFinish}`;
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
 * A5-17 加工後入庫(放置完成，回送) PUT
 * @param {*} data
 * @returns
 */
export function setTargetDetail(data) {
  const uri = `/api/processing/processingDetail/${data.isFinish}`;
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
 * A5-18 結束此單作業
 * @param {*} workStationId
 * @returns
 */
export function closeProcess(workStationId) {
  const uri = `/api/processing/finish/${docNo}`;
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
 * A5-23 取得加工單表頭資料
 * @param {*} processingId
 * @returns
 */
export function getProcessing(processingId) {
  return request({
    url: `/api/processing/header/${processingId}`,
    method: "GET",
  });
}
/**
 * 5-24  刪除加工明細 
 * @param {*} data 
 * @returns 
 */
export function delProcessingDetail(data) {
  const uri = `/api/processing/delProcessingDetail`;
  const method = "DELETE";
  return new Promise((resolve) => {
    request({
      url: uri,
      method: method,
      data
    }).then((resp) => {
      parseMessage(resp);
      resolve(resp);
    });
  });
}


/**
 * A5-25 依操作單號製單，然後產生配箱
 * @param {*} docNo
 * @returns
 */
export function getProcessAssign(docNo) {
  const uri = `/api/processing/assign/${docNo}`;
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
 * A5-27 取得操作單號的下拉選單選項
 * @returns
 */
export function getProcessDocs() {
  return request({
    url: `/api/processing/processDocOption`,
    method: "GET",
  });
}

/**
 * A5-28 刪除加工單據
 * @param {*} processingId
 * @returns
 */
export function deleteProcess(processingId) {
  return request({
    url: `/api/processing/delProcessingDoc/${processingId}`,
    method: "GET",
  });
}
