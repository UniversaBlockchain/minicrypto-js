const Formatter = require('./formatter');
const Parser = require('./parser');

module.exports = class BossProtocol {
  constructor() {
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

    for (const arg of args) formatter.put(arg);

    return formatter.toString(); // TODO: Should rename method
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
