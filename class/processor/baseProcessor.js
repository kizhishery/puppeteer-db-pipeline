const { EXCHANGE } = require("../../constants");

class BaseProcessor {

  calculateStrikeRange(underlyingValue, delta, count = 10) {
    const rounded = Math.round(underlyingValue / delta) * delta;
    return {
      lowestStrike: rounded - count * delta,
      highestStrike: rounded + count * delta,
    };
  }


  getStrikeValue(option, exchange) {
    return exchange === EXCHANGE
      ? option.strikePrice
      : Number(option.Strike_Price1);
  }


  getMiddleStrikes(options, underlyingValue, exchange) {
    const delta = exchange === EXCHANGE ? 50 : 100;
    const { lowestStrike, highestStrike } = this.calculateStrikeRange(underlyingValue, delta);

    return options.filter((option) => {
      const strike = this.getStrikeValue(option, exchange);
      return strike >= lowestStrike && strike <= highestStrike;
    });
  }


  handleProcess({ currentData, nextData, timestamp, underlyingValue, exchange, Handler }) {
    const compressedCurrent = this.getMiddleStrikes(currentData, underlyingValue, exchange);
    const compressedNext = this.getMiddleStrikes(nextData, underlyingValue, exchange);

    return {
      current: new Handler(compressedCurrent, timestamp).getData(),
      next: new Handler(compressedNext, timestamp).getData(),
    };
  }
}

module.exports = { BaseProcessor };
