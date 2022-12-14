const ProcessingStatusEnum = Object.freeze({
    /**
     * 已收單 0
     */
     Received: 0,
     /**
      * 已生效 1
      */
     Effective: 1,
     /**
      * 工作執行中 2
      */
     Progress: 2,
     /**
      * 已完成 3
      */
     Completed: 3,
     /**
      * 已作廢 4
      */
     Invalid: 4,
  });
  
  export default ProcessingStatusEnum;