const { EXCHANGE, EXCHANGE2 } = require('../../constants');

class Expiry {
  constructor(data, exchange) {
    this.data = data;
    this.exchange = exchange;
    this.expiryDates = []
  }

  getExpiry() {
    switch (this.exchange) {
      case EXCHANGE:
        this.expiryDates = this.getExpiryOne();
        break;

      case EXCHANGE2:
        this.expiryDates = this.getExpiryTwo();
        break;

      default:
        break;
    }

    return this.expiryDates;
  }

  getExpiryOne() {
    // Return first 2 elements of expiryDates array
    if (!this.data.expiryDates || !Array.isArray(this.data.expiryDates)) {
      return [];
    }
    return this.data.expiryDates.slice(0, 2);
  }

  getExpiryTwo() {
    // Return first 2 ExpiryDate values from Table1 array
    if (!this.data.Table1 || !Array.isArray(this.data.Table1)) {
      return [];
    }

    const expiryDates = this.data.Table1
      .slice(0, 2)
      .map(entry => entry?.ExpiryDate)
      .filter(Boolean); // remove undefined/null if any

    return expiryDates;
  }
}

module.exports = { Expiry };
