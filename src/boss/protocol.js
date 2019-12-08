const Formatter = require('./formatter');
const Parser = require('./parser');
const _ = require('../vendor/lodash.custom');

class BossReader {
  constructor(stream) {
    this.options = {};
    this.parser = new Parser(this, stream);
  }

  read() {
    return this.parser.get();
  }
}

class BossWriter {
  constructor() {
    this.options = {};
    this.formatter = new Formatter(this);
  }

  write(arg) {
    this.formatter.put(arg);
  }

  get() {
    return this.formatter.toArray();
  }
}

class BossProtocol {
  constructor(options = {}) {
    this.options = options;

    // Aliases
    this.pack = this.dump.bind(this);
    this.unpack = this.load.bind(this);
  }

  /**
   * Instantiates Formatter class and returns encoded string
   *
   * @param  {...*} args
   *
   * @return {String}
   */
  dump(...args) {
    const formatter = new Formatter(this);

    for (const arg of args) formatter.put(_.cloneDeep(arg));

    return formatter.toArray(); // TODO: Should rename method
  }

  /**
   * Instantiates Parser class and returns decoded value
   *
   * @param  {String}
   * @return {Array}
   */
  load(source) {
    const parser = new Parser(this, source);

    return parser.get();
  }

  /**
   * Instantiates Parser class and decodes all passed source.
   *
   * @param  {String}
   * @return {Array}
   */
  loadAll(source) {
    const parser = new Parser(this, source);
    const result = [];

    var value;

    while (value = parser.get()) result.push(value);

    return result;
  }

  check(condition, message = null) {
    if (condition !== message) throw new Error('Invalid argument');
  }
};


BossProtocol.writer = BossWriter;
BossProtocol.reader = BossReader;

module.exports = BossProtocol;
