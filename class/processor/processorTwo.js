const { BaseProcessor } = require("./baseProcessor");
const { OptionChainParentTWO } = require("../api");

class ProcessorTwo extends BaseProcessor {
  constructor(data) {
    super();
    this.data = data;
  }

  process() {
    const {
      attr: { exchange },
      data: {
        current: { Table: currentData, ASON: { DT_TM: timestamp } },
        next: { Table: nextData },
      },
    } = this.data;

    // Default underlying value for this exchange
    const underlyingValue = 81500;

    return this.handleProcess({
      currentData,
      nextData,
      timestamp,
      underlyingValue,
      exchange,
      Handler: OptionChainParentTWO,
    });
  }
}

module.exports = { ProcessorTwo };
