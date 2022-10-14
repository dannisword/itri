import request from "@/utils/request";

/**
 * 收單作業
 * @returns
 */
 export function importInventory() {
    return request({
      url: `/api/inventory/import`,
      method: "POST",
    });
  }
  /**
   * 開工預先叫單
   * @returns
   */
  export function preInventory() {
    return request({
      url: `/api/inventory/preInvoke`,
      method: "POST",
    });
  }
  
  /**
   * 新增加工叫單數
   * @param {*} data
   * @returns
   */
  export function addInventory(data) {
    return request({
      url: `/api/inventory/sysParam`,
      method: "POST",
      data,
    });
  }
  /**
   * 修改加工叫單數
   * @param {*} data
   * @returns
   */
  export function setInventory(data) {
    return request({
      url: `/api/inventory/sysParam`,
      method: "PUT",
      data,
    });
  }
  /**
   * 查詢出庫叫單數
   * @param {*} params
   * @returns
   */
  export function getInventories(params) {
    return request({
      url: `/api/inventory/sysParam`,
      method: "GET",
    });
  }
  