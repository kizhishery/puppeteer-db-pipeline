const { TTL } = require('../../constants');

class MostActiveContractTWO {
  
  constructor(data,timestamp) {
    const mapping = {
      str: "STRIKE_PRICE",
      ul: "Series_Name"
    };
    
    for (const [alias, originalKey] of Object.entries(mapping)) {
      this[alias] = data[originalKey];
    }
    
    this.ts = this.getTimestamp(timestamp)
    this.ttl = this.getTTL();
    this.key = "active";
    this.ul = this.ul.substr(0,6)
  }

  getTimestamp(time) {
    const timestamp = new Date(new Date(time + ' UTC')).toISOString();
    return timestamp;
  }
  
  getTTL() {
    let ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.round(ttl + TTL);
  }

  getData() {
    let items = {
        ts : this.ts,
        ttl : this.ttl,
        key: this.key,
        str : this.str,
        ul : this.ul
    }
      
    return items;
  }
}

module.exports = { MostActiveContractTWO };