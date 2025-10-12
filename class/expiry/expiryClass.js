// Class for data1
class ExpiryOne {
  constructor(data) {
    this.data = data;
  }

  getExpiry() {
    // Return first 2 elements of expiryDates array
    if (!this.data.expiryDates || !Array.isArray(this.data.expiryDates)) {
      return [];
    }
    return this.data.expiryDates.slice(0, 2);
  }
}

// Class for data2
class ExpiryTwo {
  constructor(data) {
    this.data = data;
  }

  getExpiry() {
    // Return first 2 elements of Table1 array
    if (!this.data.Table1 || !Array.isArray(this.data.Table1)) {
      return [];
    }
    const [data1,data2] = this.data.Table1.slice(0, 2);

    return [data1?.ExpiryDate,data2?.ExpiryDate]
  }
}

module.exports = { ExpiryOne, ExpiryTwo };
