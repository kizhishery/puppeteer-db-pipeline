const { BaseProcessor } = require("./baseProcessor");
const { OptionChainParent } = require("../api");

class ProcessorOne extends BaseProcessor {
  constructor(data) {
    super();
    this.data = data;
  }

  process() {
    const {
      attr: { exchange },
      data: {
        current: {
          records: { timestamp, underlyingValue, data: currentData },
        },
        next: {
          records: { data: nextData },
        },
      },
    } = this.data;

    return this.handleProcess({
      currentData,
      nextData,
      timestamp,
      underlyingValue,
      exchange,
      Handler: OptionChainParent,
    });
  }
}

module.exports = { ProcessorOne };
