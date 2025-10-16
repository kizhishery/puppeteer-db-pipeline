const { BaseProcessor } = require("./baseProcessor");
const { OptionChainParentTWO, MostActiveContractTWO, FutureTWO } = require("../api");

class ProcessorTwo extends BaseProcessor {
  constructor(data) {
    super();
    this.data = data;
  }

  process() {
    // debugger;
    const {
      attr: { exchange },
      data: {
        current: { Table: currentData, ASON: { DT_TM: timestamp } },
        next: { Table: nextData },
        active : [ mostActive ],
        future : [ firstFuture, { LTP } ]
      },
    } = this.data;

    // Default underlying value for this exchange
    const underlyingValue = LTP;

    const { current , next } = this.handleProcess({
      currentData,
      nextData,
      timestamp,
      underlyingValue,
      exchange,
      Handler: OptionChainParentTWO,
    });

    const active = new MostActiveContractTWO(mostActive,timestamp).getData();
    const future = new FutureTWO(firstFuture,timestamp).getData();

    return { current, next, active, future};
  }
}

module.exports = { ProcessorTwo };
