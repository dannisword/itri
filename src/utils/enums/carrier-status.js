const CarrierStatusEnum = Object.freeze({
  /**
   * 已抵達儲位 0
   */
  Arrive: 0,
  /**
   * 呼叫取出 1
   */
  CallOut: 1,
  /**
   * 呼叫入儲 2
   */
  CallIn: 2,
  /**
   * 已抵達站點 3
   */
  Arrived: 3,
  /**
   * 排隊待呼叫 4
   */
  Queued: 4,
  /**
   * 取下 5
   */
  Remove: 5,
});

export default CarrierStatusEnum;
