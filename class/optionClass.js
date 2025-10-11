const { TTL } = require('../constants');

class OptionData {
  constructor(data) {
    const mapping = {
      oi: "openInterest",
      vol: "totalTradedVolume",
      iv: "impliedVolatility",
      ltp: "lastPrice",
      tBQ: "totalBuyQuantity",
      tSQ: "totalSellQuantity",
      bP: "buyPrice1",
      bQ: "buyQuantity1",
      sP: "sellPrice1",
      sQ: "sellQuantity1",
      ul: "underlying",
      ulv: "underlyingValue",
    };

    for (const [prop, key] of Object.entries(mapping)) {
      let value = data[key];
      if (typeof value === "number") value = Math.round(value * 100) / 100;
      this[prop] = value ?? null;
    }
  }
}

class OptionChainONE {
  constructor(data, timestamp) {
    this.ts = this.getTimestamp(timestamp);
    this.exp = this.getExpiry(data.expiryDates);
    this.str = data.strikePrice ?? 0;
    
    this.ttl = this.getTTL();
    this.key = `${this.str} | ${this.exp}`;
    
    this.ce = new OptionData(data.CE ?? {});
    this.pe = new OptionData(data.PE ?? {});
  }

  getTimestamp(time) {
    let timestamp = new Date(time + ' UTC').toISOString();
    return timestamp;
  }

  getExpiry(time) {
    let expiry = new Date(time + ' UTC').toISOString().split('T')[0] ?? null;
    return expiry;
  }

  getTTL() {
    let ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.floor(ttl + TTL);
  }

  getData() {
    return {
      ts: this.ts,
      key: this.key,
      exp: this.exp,
      str: this.str,
      ce: { ...this.ce },
      pe: { ...this.pe },
      ttl: this.ttl,
    };
  }
}

// Parent class that holds multiple OptionChainONE children
class OptionChainParent {
  constructor(dataArray, timestamp) {
    this.arr = dataArray.map(data => new OptionChainONE(data, timestamp));
  }

  getData() {
    return this.arr.map(child => child.getData());
  }
}

module.exports = { OptionChainParent };
