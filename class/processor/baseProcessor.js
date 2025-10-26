// baseProcessor.js
const { EXCHANGE } = require("../../constants");

class BaseProcessor {
  // --- Strike range calculations ---
  calculateStrikeRange(underlyingValue, delta, count = 10) {
    const rounded = Math.round(underlyingValue / delta) * delta;
    return {
      lowestStrike: rounded - count * delta,
      highestStrike: rounded + count * delta,
    };
  }

  // --- Strike helpers ---
  getStrikeValue(option, exchange) {
    return exchange === EXCHANGE
      ? option.strikePrice
      : Number(option.Strike_Price1);
  }

  getMiddleStrikes(options, underlyingValue, exchange) {
    const delta = exchange === EXCHANGE ? 50 : 100;
    const { lowestStrike, highestStrike } = this.calculateStrikeRange(
      underlyingValue,
      delta
    );

    return options.filter((option) => {
      const strike = this.getStrikeValue(option, exchange);
      return strike >= lowestStrike && strike <= highestStrike;
    });
  }

  // --- Option Chain handler ---
  handleProcess({ currentData, nextData, timestamp, underlyingValue, exchange, Handler }) {
    const compressedCurrent = this.getMiddleStrikes(currentData, underlyingValue, exchange);
    const compressedNext = this.getMiddleStrikes(nextData, underlyingValue, exchange);

    return {
      current: new Handler(compressedCurrent, timestamp).getData(),
      next: new Handler(compressedNext, timestamp).getData(),
    };
  }

  // --- FUTURE handler ---
  handleFuture({ value, timestamp, FutureHandler, filter }) {
    let filterFuture;
    if(filter)
      filterFuture = value.find((val) => val.instrumentType === "FUTIDX");
    else
      filterFuture = value;

    return new FutureHandler(filterFuture, timestamp).getData();
  }

  // --- ACTIVE (most active) handler ---
  handleActive({ volume, timestamp, MostActiveHandler, filter }) {
    let filterVolume 
    if(filter)
      filterVolume = volume.find((val) => val.instrumentType === "OPTIDX");
    else 
      filterVolume = volume;
    
    return new MostActiveHandler(filterVolume, timestamp).getData();
  }
}

module.exports = { BaseProcessor };
