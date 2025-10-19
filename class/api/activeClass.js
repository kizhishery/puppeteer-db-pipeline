const { TTL, DYNAMO_DB_TABLE_ACTIVE } = require('../../constants');

class MostActiveContractONE {
  
  constructor(data,timestamp) {
    const mapping = {
      str: "strikePrice",
      ul: "underlying"
    };
    
    for (const [alias, originalKey] of Object.entries(mapping)) {
      this[alias] = data[originalKey];
    }
    
    this.ts = this.#getTimestamp(timestamp);
    this.ttl = this.#getTTL();
    this.key = `A | ${this.ul}`;
  }

  #getTimestamp(time) {
    let timestamp = new Date(time + ' UTC').toISOString();
    return timestamp;
  }
  
  #getTTL() {
    let ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.floor(ttl + TTL);
  }

  getData() {
    let items = {
        ts : this.ts,
        key: this.key,
        str : this.str,
        ul : this.ul,
        ttl : this.ttl,
        table : DYNAMO_DB_TABLE_ACTIVE
      }
      
      return items;
  }
}

module.exports = { MostActiveContractONE };