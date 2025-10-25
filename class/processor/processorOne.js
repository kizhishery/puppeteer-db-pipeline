const { BaseProcessor } = require("./baseProcessor");
const { OptionChainParent, FutureONE, MostActiveContractONE } = require("../api");

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
        active : { value : { data : value }, volume : { data : volume }}
      },
    } = this.data;

    const { current, next } = this.handleProcess({
      currentData,
      nextData,
      timestamp,
      underlyingValue,
      exchange,
      Handler: OptionChainParent,
    });

    const filterFuture = value.find(val => val.instrumentType == "FUTIDX");
    // const filterVolume = volume.find(val => val.instrumentType == "OPTIDX");

    const future = new FutureONE(filterFuture,timestamp).getData();
    // const active = new MostActiveContractONE(filterVolume, timestamp).getData();
    
    return { current, next, /*active,*/ future };
  }
}

module.exports = { ProcessorOne };
