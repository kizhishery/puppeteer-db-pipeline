const { BaseProcessor } = require("./baseProcessor");
const { OptionChainParentTWO, MostActiveContractTWO, FutureTWO } = require("../api");

class ProcessorTwo extends BaseProcessor {
  constructor(data) {
    super();
    this.data = this.normalizeData(data);
  }

  normalizeData(raw) {
    if (!raw) return {};

    const d = raw.data ?? {};
    const current = d.current ?? {};
    const next = d.next ?? {};
    const activeArr = d.active ?? [];
    const futureArr = d.future ?? [];

    return {
      exchange: raw.attr?.exchange ?? null,
      timestamp: current.ASON?.DT_TM ?? null,
      underlyingValue: futureArr[0]?.LTP ?? null,
      currentData: current.Table ?? [],
      nextData: next.Table ?? [],
      mostActive: activeArr[0] ?? null,
      firstFuture: futureArr[0] ?? null,
    };
  }

  process() {
    const { 
      exchange, 
      timestamp, 
      underlyingValue, 
      currentData, 
      nextData, 
      mostActive, 
      firstFuture 
    } = this.data;

    // Option chain processing
    const { current, next } = this.handleProcess({
      currentData,
      nextData,
      timestamp,
      underlyingValue,
      exchange,
      Handler: OptionChainParentTWO,
    });

    // Active & Future using BaseProcessor helpers
    const active = this.handleActive({
      volume: mostActive,
      timestamp,
      MostActiveHandler: MostActiveContractTWO,
      filter : false
    });

    const future = this.handleFuture({
      value: firstFuture,
      timestamp,
      FutureHandler: FutureTWO,
      filter : false
    });

    return { current, next, active, future };
  }
}

module.exports = { ProcessorTwo };
