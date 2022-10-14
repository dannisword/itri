import request from "@/utils/request";
/**
 * 登入
 * @param {String} account
 * @param {String} password
 * @returns {*}
 */
export function login(userInfo) {
  return request({
    url: `/api/auth/login`,
    method: "POST",
    data: {
      account: userInfo.account,
      password: userInfo.password,
    },
  });
}
/**
 * 登出
 * @returns
 */
export function logout() {
  return request({
    url: `/api/auth/logout`,
    method: "POST",
  });
}

/**
 * A1-15 查詢站別人員名單
 * @param {*} params @empolyeeId @workStationId
 * @returns
 */
export function getEmployees(params) {
  return request({
    url: `/api/station/employee/search/${params}`,
    method: "GET",
  });
}

/**
 * 測試資料
 * @param {*} name
 */
function getUser(account) {
  return {
    userId: 1,
    roles: [1, 2],
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  };
}

export function _login(account, password) {
  return new Promise((resolve, reject) => {
    var data = getUser(account);
    resolve(data);
  });
}
