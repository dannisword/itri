/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ["admin", "editor"];
  return valid_map.indexOf(str.trim()) >= 0;
}
/**
 * 英數自判斷
 * @param {*} val
 * @returns
 */
export function validLetters(val) {
  var re = /[^\a-\z\A-\Z0-9_]/g;
  if (val.match(re) == null) {
    return false;
  }
  return true;
}
/**
 * 驗證空字串
 * @param {*} val
 * @returns
 */
export function validEmpty(val) {
  return val == undefined || val == null || val == "" ? true : false;
}
/**
 * 限英數字與特殊符號，不可有空白格。
 * @param {*} val
 */
export function validPassword(val) {
  console.log(val)
  var re = /[^\a-\z\A-\Z0-9\~!@#$%^&*_-]/g
  return val.match(re) == null ? false : true;
}
