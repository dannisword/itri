/**
 * 下拉選單
 */
export class Selecter {
  constructor(data) {
    this.id = data.id === undefined ? 0 : data.id;
    this.lable = data.lable === undefined ? undefined : data.lable;
    this.value = data.value === undefined ? undefined : data.value;
  }
}
