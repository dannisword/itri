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
  var re = /[^\a-\z\A-\Z0-9]/g;
  if (val.match(re) == null) {
    return false;
  }
  return true;
}
/**
 * 
 * @param {*} val 
 * @returns 
 */
export function validEmpty(val){
  return val == undefined || val== null || val=="" ? true: false 
}
