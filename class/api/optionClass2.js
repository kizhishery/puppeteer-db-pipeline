const { TTL } = require("../../constants");

class OptionChainTWO {
  constructor(data, timestamp) {
    // 🔹 Nested helper class for CE/PE
    class OptionData {
      constructor(data, prefix = "") {
        const mapping = {
          oi: "Open_Interest",
          vol: "Vol_Traded",
          iv: "IV",
          ltp: "Last_Trd_Price",
          tBQ: "BIdQty",
          tSQ: "OfferQty",
          bP: "BidPrice",
          bQ: "BIdQty",
          sP: "OfferPrice",
          sQ: "OfferQty",
        };

        for (const [prop, key] of Object.entries(mapping)) {
          // Try with prefix (e.g. "C_Open_Interest") and without
          let value = data[`${prefix}${key}`] ?? data[key] ?? null;

          value = Number(String(value).replace(/,/g, ""));
          if (isNaN(value)) value = 0;

          this[prop] = Math.round(value * 100) / 100;
        }
      }
    }

    // 🕐 Core fields
    this.ts = this.#getTimestamp(timestamp);
    this.exp = this.#getExpiry(data.End_TimeStamp);
    this.str = parseFloat((data.Strike_Price || "0").replace(/,/g, "")) || 0;
    this.ttl = this.#getTTL();
    this.key = `O | ${this.str} | ${this.exp}`;

    // 🔹 Extract underlying values once
    this.ul = data.C_Ula_Code ?? data.Ula_Code ?? null;
    this.ulv = Number(String(data.C_UlaValue ?? data.UlaValue ?? 0).replace(/,/g, "")) || null;

    // 🔹 Remove redundant fields to avoid duplication
    const cleanData = { ...data };
    delete cleanData.Ula_Code;
    delete cleanData.UlaValue;
    delete cleanData.C_Ula_Code;
    delete cleanData.C_UlaValue;

    // 🔹 Instantiate CE & PE with appropriate prefixes
    this.ce = new OptionData(cleanData, "C_");
    this.pe = new OptionData(cleanData, "P_");
  }

  #getTimestamp(time) {
    time = time.replace("|", "");
    return new Date(new Date(time + " UTC")).toISOString();
  }

  #getExpiry(date) {
    return new Date(date).toISOString().split("T")[0];
  }

  #getTTL() {
    const ttl = Math.floor(new Date(this.ts).getTime() / 1000);
    return Math.round(ttl + TTL);
  }

  getData() {
    return {
      ts: this.ts,
      exp: this.exp,
      str: this.str,
      key: this.key,
      ttl: this.ttl,
      ul: this.ul,
      ulv: this.ulv,
      ce: { ...this.ce },
      pe: { ...this.pe },
    };
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
