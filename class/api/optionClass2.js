const { TTL } = require("../../constants");

class OptionChainTWO {
  constructor(data, timestamp) {
    // Nested class for CE/PE data mapping
    class OptionData {
      constructor(data) {
        const mapping = {
          oi: "Open_Interest",
          // coi: "Absolute_Change_OI",
          vol: "Vol_Traded",
          iv: "IV",
          ltp: "Last_Trd_Price",
          // chg: "NetChange",
          tBQ: "BIdQty",
          tSQ: "OfferQty",
          bP: "BidPrice",
          bQ: "BIdQty",
          sP: "OfferPrice",
          sQ: "OfferQty",
          ul: "Ula_Code",
          ulv: "UlaValue",
        };

        for (const [prop, key] of Object.entries(mapping)) {
          let value = data[key] ?? data[key.replace(/^C_/, "")] ?? null;

          // Skip conversion for 'ul'
          if (prop == "ul") {
            this[prop] = value;
            // debugger;
            continue;
          }

          value = Number(String(value).replace(/,/g, ""));
          if (isNaN(value)) value = 0;

          this[prop] = Math.round(value*100)/100;
        }
      }
    }

    // debugger
    this.ts = this.#getTimestamp(timestamp);
    this.exp = this.#getExpiry(data.End_TimeStamp);
    
    this.str = parseFloat((data.Strike_Price || "0").replace(/,/g, "")) || 0;
    this.ttl = this.#getTTL();
    
    // key = strike | expiry
    this.key = `${this.str} | ${this.exp}`;

    // CE = all fields prefixed with C_, PE = remaining
    this.ce = new OptionData(data);
    this.pe = new OptionData(data); // For TWO, PE can be mapped differently if needed
  }

  #getTimestamp(time) {
    time = time.replace('|','');
    const timestamp = new Date(new Date(time + " UTC")).toISOString();
    return timestamp;
  }

  #getExpiry(date) {
    const expiry = new Date(date).toISOString().split("T")[0];
    return expiry;
  }
  #getTTL() {
    let ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.round(ttl + TTL);
  }

  getData() {
    const obj = {
      ts: this.ts,
      exp: this.exp,
      str: this.str,
      key: this.key,
      ce: { ...this.ce },
      pe: { ...this.pe },
    };

    // debugger;
    return obj;
  }
}

class OptionChainParentTWO {
  constructor(dataArray, timestamp) {
    this.arr = dataArray.map((data) => new OptionChainTWO(data, timestamp));
  }

  getData() {
    return this.arr.map((child) => child.getData());
  }
}

module.exports = { OptionChainParentTWO };
