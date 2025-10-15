const { TTL } = require('../../constants');

class FutureONE {
  constructor(data,timestamp) {
    const mapping = {
      exp: "expiryDate",
      ltp: "lastPrice",
      tto: "totalTurnover",
      oi: "openInterest",
      ul: "underlying",
      ulv: "underlyingValue",
      vol: "numberOfContractsTraded",
    };
    
    // Map each target key to its source field
    for (const [prop, key] of Object.entries(mapping)) {
      let value = data[key] ?? null;
      
      // Round numeric fields slightly for readability
      if (typeof value === "number") {
        value = Math.round(value * 100) / 100;
      }
      
      this[prop] = value;
    }
    
    // debugger;
    // Keep timestamp and a simple ID/key if needed
    this.ts = this.#getTimestamp(timestamp);
    this.exp = this.#getExpiry()
    this.key = `${this.ul} | ${this.exp}`;
    this.tto = Math.round(this.tto,2)
    this.ttl = this.#getTTL();
  }

  #getTimestamp(time) {
    let timestamp = new Date(time + ' UTC').toISOString();
    return timestamp;
  }

  #getExpiry() {
    let expiry = new Date(this.exp + ' UTC').toISOString().split('T')[0] ?? null;
    return expiry;
  }

  #getTTL() {
    let ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.round(ttl + TTL);
  }

  getData() {
    const items = {
      ts: this.ts,
      key: this.key,
      exp: this.exp,
      ulv: this.ulv,
      ul: this.ul,
      ltp: this.ltp,
      vol: this.vol,
      tto: this.tto,
      oi: this.oi,
      ulv: this.ulv,
    };

    return items;
  }
}


module.exports = { FutureONE };