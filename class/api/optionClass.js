const { TTL, DYNAMO_DB_TABLE_OPTION } = require('../../constants');

class OptionData {
  constructor(data) {
    const mapping = {
      oi: "openInterest",
      vol: "totalTradedVolume",
      iv: "impliedVolatility",
      ltp: "lastPrice",
      tbq: "totalBuyQuantity",
      tsq: "totalSellQuantity",
      bp: "buyPrice1",
      bq: "buyQuantity1",
      sp: "sellPrice1",
      sq: "sellQuantity1",
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
    this.key = `O | ${this.str} | ${this.exp}`;

    // Extract underlying data just once
    const ceData = data.CE ?? {};
    const peData = data.PE ?? {};

    this.ul = ceData.underlying ?? peData.underlying ?? null;
    this.ulv = ceData.underlyingValue ?? peData.underlyingValue ?? null;

    delete ceData.underlying;
    delete ceData.underlyingValue;
    delete peData.underlying;
    delete peData.underlyingValue;

    this.ce = new OptionData(ceData);
    this.pe = new OptionData(peData);
  }

  getTimestamp(time) {
    return new Date(time + ' UTC').toISOString();
  }

  getExpiry(time) {
    return (new Date(time + ' UTC').toISOString().split('T')[0]) ?? null;
  }

  getTTL() {
    const ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.floor(ttl + TTL);
  }

  getData() {
    return {
      ts: this.ts,
      key: this.key,
      exp: this.exp,
      str: this.str,
      ttl: this.ttl,
      ul: this.ul,
      ulv: this.ulv,
      ce: { ...this.ce },
      pe: { ...this.pe },
      table : DYNAMO_DB_TABLE_OPTION
    };
  }
}

class OptionChainParent {
  constructor(dataArray, timestamp) {
    this.arr = dataArray.map(data => new OptionChainONE(data, timestamp));
  }

  getData() {
    return this.arr.map(child => child.getData());
  }
}

module.exports = { OptionChainParent };
