const { Buffer } = require('buffer');

const buffer = require('./struct');
const types = require('./types');
const StringIO = require('./stringio');

const jsbn = require('jsbn');

const { BigInteger } = jsbn;
const { textToBytes, byteStringToBytes } = require('../utils');
const { chr, isNone, indexOfObject } = require('./helpers');

const {
  INT,
  EXTRA,
  NINT,
  TEXT,
  BIN,
  CREF,
  LIST,
  DICT,

  DZERO,
  FZERO,
  DONE,
  FONE,
  DMINUSONE,
  FMINUSONE,
  TFLOAT,
  TDOUBLE,
  TTRUE,
  TFALSE,
  TCOMPRESSED,
  TTIME,
  XT_STREAM_MODE
} = types; // Headers

module.exports = class Formatter {
  constructor(protocol) {
    this.protocol = protocol;
    this.cache = {};
    this.cache[0] = null;

    this.primitivesCache = {};


    this.buffer = new StringIO(); // Ready to write
  }

  put(value) {
    if (isNone(value))
      return this.writeHeader(CREF, 0);

    const self = this;

    function writeNumber(value) {
      if (value === parseInt(value)) { // Integer
        return self.writeHeader(value < 0 ? NINT : INT, Math.abs(value));
      } else {
        // All numbers in JavaScript are 64-bit floating point numbers.
        self.writeHeader(EXTRA, TDOUBLE);
        return self.writeDouble(value);
      }
    }

    function writeString(value) {
      if (self.isCached(value))
        return self.writeReference(value);

      self.cacheObject(value);
      const buffer = Buffer.from(value);

      self.writeHeader(TEXT, buffer.byteLength);
      return self.writeBinary(buffer.toString('binary'));
    }

    function writeBinary(value) {
      const buffered = Buffer.from(value.buffer);
      const binary = buffered.toString('binary');

      if (self.isCached(binary))
        return self.writeReference(binary);

      self.cacheObject(binary);
      self.writeHeader(BIN, buffered.byteLength);

      return self.writeBinary(binary);
    }

    function writeBoolean(value) {
      return self.writeHeader(EXTRA, value ? TTRUE : TFALSE);
    }

    function writeArray(value) {
      if (self.isCached(value))
        return self.writeReference(value);

      self.writeHeader(LIST, value.length);
      self.cacheObject(value);

      for (const v of value) {
        self.put(v);
      }

      return self;
    }

    function writeDate(value) {
      self.writeHeader(EXTRA, TTIME); // TODO: Should validate?
      return self.writeSegment(parseInt(value.getTime() / 1000));
    }

    function writeObject(value) {
      if (self.isCached(value))
        return self.writeReference(value);

      const keys = Object.keys(value).filter(key => {
        if (key === "___id") return false;

        const val = value[key];
        return isNone(val) || val.constructor.name != "Function";
      });

      self.writeHeader(DICT, keys.length);
      self.cacheObject(value);

      for (const key of keys) {
        self.put(key);
        self.put(value[key]);
      }

      return self;
    }

    function classifyByConstructorName() {
      const constructorName = value.constructor.name;

      switch (constructorName) {
        case 'Number': return writeNumber(value);
        case 'String': return writeString(value);
        case 'Buffer':
        case 'Uint8Array': return writeBinary(value);
        case 'Boolean': return writeBoolean(value);
        case 'Date': return writeDate(value);
        case 'Array': return writeArray(value);
        case 'Object': return writeObject(value);
        default: return classifyByInstance();
      }
    }

    function classifyByInstance() {
      if (value instanceof Number) return writeNumber(value);
      if (value instanceof String) return writeString(value);
      if (value instanceof Buffer || value instanceof Uint8Array)
        return writeBinary(value);
      if (value instanceof Boolean) return writeBoolean(value);
      if (value instanceof Date) return writeDate(value);
      if (value instanceof Array) return writeArray(value);
      if (value instanceof Object) return writeObject(value);

      const errMsg = "unknown type " + (constructorName || "without constructor name");

      throw new Error("Boss dump error: " + errMsg);
    }

    if (value.constructor) return classifyByConstructorName();
    else return classifyByInstance();
  }

  /**
   * Returns true if cache contains given object
   *
   * @param  {Object|Array|String}  obj
   * @return {Boolean}
   */
  isCached(obj) {
    return typeof obj == 'object' ? obj['___id'] : this.primitivesCache[obj];
  }

  /**
   * Adds given object into cache and returns it after.
   *
   * @param  {Object|Array|String}  obj
   * @return {Object|Array|String}
   */
  cacheObject(obj) {
    const index = Object.keys(this.cache).length + Object.keys(this.primitivesCache).length;

    if (typeof obj == 'object') {
      this.cache[index] = obj;
      obj["___id"] = index;
    } else {
      this.primitivesCache[obj] = index;
    }

    return obj;
  }

  /**
   * Write short reference index instead of original value
   *
   * @param  {Object|Array|String} obj
   * @return {Formatter}
   */
  writeReference(obj) {
    const isObject = typeof obj == 'object';

    return this.writeHeader(CREF, isObject ? obj['___id'] : this.primitivesCache[obj]);
  }

  /**
   * Writes standard record header with code and value
   *
   * @param  {Number} code
   * @param  {Number} value
   *
   * @return {Formatter}
   */
  writeHeader(code, value) {
    // this.protocol.check(value >= 0 && value <= 7);
    // this.protocol.check(value >= 0);

    if (value < 23)
      return this.writeByte(code | value << 3);

    // Get the size of the value (0..9)
    const size = this.sizeBytes(value);

    if (size < 9) {
      this.writeByte(code | (size + 22) << 3);
    } else {
      this.writeByte(code | 0xF8);
      this.writeSegment(size);
    }

    for (let i = 0; i < size; i++) {
      this.writeByte(value & 0xFF);
      value >>=8;
    }

    return this;
  }

  /**
   * Writes variable-length positive integer
   *
   * @param  {Number} value
   * @return {Formatter}
   */
  writeSegment(value) {
    // TODO: checkArg value >= 0
    var bigVal = new BigInteger(value.toString());
    var big7f = new BigInteger((0x7f).toString());
    var big80 = new BigInteger((0x80).toString());

    while (bigVal.compareTo(big7f) > 0) {
      this.writeByte(bigVal.and(big7f).toString(10));
      bigVal = bigVal.shiftRight(7);
    }

    return this.writeByte(bigVal.or(big80).toString(10));
  }

  /**
   * Packed and writes packed double number into buffer
   *
   * @param  {Number} value
   * @return {Formatter}
   */
  writeDouble(value) {
    const bytes = buffer.pack('<d', [value]);
    const binary = [];

    var val;

    for(var i = 0; i < bytes.length; i++) {
      val = bytes[i];
      binary.push(chr([val]));
    }

    return this.writeBinary(binary);
  }

  /**
   * Writes char-coded string into buffer
   *
   * @param  {Number|String} value
   * @return {Formatter}
   */
  writeByte(value) {
    this.writeBinary(chr([value]));

    return this;
  }

  /**
   * Writes an encoded string into buffer
   *
   * @param  {String} value
   * @return {Formatter}
   */
  writeBinary(value) {
    if (Array.isArray(value))
      this.buffer.writeLines(value);
    else
      this.buffer.write(value);

    return this;
  }

  /**
   * Determines minimum amount of bytes needed to
   * store value (should be positive integer)
   *
   * @param  {Number} value
   * @return {Number}
   */
  sizeBytes(value) {
    // TODO: checkArg value >= 0

    var minimum = new BigInteger('100', 16);
    var counter = 1;

    while (value >= minimum) {
      counter += 1;
      minimum = minimum.shiftLeft(8);
    }

    return counter;
  }

  toString() {
    return this.buffer.getValue();
  }

  toArray() {
    const str = this.buffer.getValue();

    return byteStringToBytes(str);
  }
};
