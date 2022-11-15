const InvDocStatusEnum = Object.freeze({
    /**
     * 已收單 0
     */
    Received: 0,
    /**
     * 已生效 1
     */
    Effective: 1,
    /**
     * 執行中
     */
    Progress: 2,
    /**
     * 已完成
     */
    Completed: 3,
    /**
     * 已完成-有盤差
     */
    Finished: 4,
    /**
     * 鎖定 locking
     */
    Invalid: 5,
  });

  export default InvDocStatusEnum;