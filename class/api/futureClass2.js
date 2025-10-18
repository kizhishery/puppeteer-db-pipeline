const { TTL } = require('../../constants');

class FutureTWO {
  constructor(data,timestamp) {
    // Mapping from raw TWO fields → normalized keys
    const mapping = {
      ul: "Series_Name",                 // Underlying 
      exp: "EXPIRY_OF_CONTRACT",      // Expiry date
      ltp: "LTP",                        // Last traded price
      vol: "NO_OF_CONTRACTS",            // Number of contracts traded
      tto: "TURNOVER",                   // Total turnover
      oi: "OPEN_INTEREST",               // Open interest
      ulv: "CloseRate"                   // Underlying value proxy
    };
    
    // Apply mapping and clean values
    for (const [prop, key] of Object.entries(mapping)) {
      let value = data[key] ?? null;
      
      if (typeof value === "string" && !isNaN(value.replace(/,/g, ""))) {
        value = parseFloat(value.replace(/,/g, ""));
      }
      
      if (typeof value === "number") {
        value = Math.round(value * 100) / 100;
      }
      
      this[prop] = value;
    }
    
    // debugger;
    this.ts = this.#getTimestamp(timestamp);
    this.exp = this.#getExpiry();
    this.ul = this.ul.substr(0,6);
    this.key = `F | ${this.ul} | ${this.exp}`;
    this.ttl = this.#getTTL();
  }
  
  #getTimestamp(time) {
    const trimedDate = this.#getTrimmed(time);
    const timestamp = new Date(trimedDate + ' UTC').toISOString();
    return timestamp;
  }

  #getTrimmed(time) {
    const trim = time.trim().replace('|','');
    return trim;
  }
  
  #getExpiry() {
    const expiry = new Date(this.exp + ' UTC').toISOString().split('T')[0];
    return expiry;
  }

  #getTTL() {
    let ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.round(ttl + TTL);
  }

  getData() {
    const items = {
      ts: this.ts,
      exp: this.exp,
      ttl: this.ttl,
      ul: this.ul,
      key: this.key,
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

module.exports = { FutureTWO };
