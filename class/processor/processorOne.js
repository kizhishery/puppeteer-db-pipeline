const { BaseProcessor } = require("./baseProcessor");
const {
  OptionChainParent,
  FutureONE,
  MostActiveContractONE,
} = require("../api");

class ProcessorOne extends BaseProcessor {
  constructor(data) {
    super();
    this.data = this.normalizeData(data);
  }

  normalizeData(raw) {
    if (!raw) return {};

    const d = raw.data ?? {};
    const current = d.current?.records ?? {};
    const next = d.next?.records ?? {};
    const active = d.active ?? {};

    return {
      exchange: raw.attr?.exchange ?? null,
      timestamp: current.timestamp ?? null,
      underlyingValue: current.underlyingValue ?? null,
      currentData: current.data ?? [],
      nextData: next.data ?? [],
      value: active.value?.data ?? [],
      volume: active.volume?.data ?? [],
    };
  }

  process() {
    const {
      exchange,
      timestamp,
      underlyingValue,
      currentData,
      nextData,
      value,
      volume,
    } = this.data;

    const { current, next } = this.handleProcess({
      currentData,
      nextData,
      timestamp,
      underlyingValue,
      exchange,
      Handler: OptionChainParent,
    });

    let future;
    if(value.length) {
      future = this.handleFuture({
        value,
        timestamp,
        FutureHandler: FutureONE,
        filter : true 
      });
    }
    
    let active;
    if(value.length) {
      active = this.handleActive({
        volume,
        timestamp,
        MostActiveHandler: MostActiveContractONE,
        filter : true
      });
    }
    return { current , next , active, future };
  }
}


module.exports = { ProcessorOne };
