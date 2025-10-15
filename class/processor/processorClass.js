const { EXCHANGE } = require("../../constants");
const { ProcessorOne } = require("./processorOne");
const { ProcessorTwo } = require("./processorTwo");

class Processor {
  constructor(data) {
    this.data = data;
    this.exchange = data?.attr?.exchange || null;
  }

  process() {
    if (!this.data || !this.data.data) {
      return { current: null, next: null, active : null, future : null };
    }

    if (this.exchange === EXCHANGE) {
      return new ProcessorOne(this.data).process();
    } else {
      return new ProcessorTwo(this.data).process();
    }
  }
}

module.exports = { Processor };
