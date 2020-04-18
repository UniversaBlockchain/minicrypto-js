const buffer = require('./struct');

const { Buffer } = require('buffer');

const types = require('./types');
const StringIO = require('./stringio');

const jsbn = require('jsbn');

const { ord } = require('./helpers');

const { BigInteger } = jsbn;
const { bytesToText, byteStringToBytes, bytesToByteString } = require('../utils');

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
} = types;

module.exports = class Parser {
  constructor(protocol, source) {
    this.protocol = protocol;
    this.buffer = new StringIO(bytesToByteString(source));

    // Aliases
    this.read = this.get.bind(this);
    this.cache = [null];
  }

  /**
   * Reads header and returns value that corresponds to this header.
   *
   * @return {*}
   */
  get() {
    if (this.buffer.isEnd()) return undefined;

    const { code, value } = this.readHeader();

    switch (code) {
      case INT:
        return value;
      case NINT:
        return -value;
      case EXTRA:
        switch (value) {
          case TTRUE:
            return true;
          case TFALSE:
            return false;
          case DZERO:
          case FZERO:
            return 0;
          case DONE:
          case FONE:
            return 1;
          case DMINUSONE:
          case FMINUSONE:
            return -1;
          case TFLOAT:
            return this.readFloat();
          case TDOUBLE:
            return this.readDouble();
          case TTIME:
            return new Date(this.readSegment() * 1000);
            // TODO: TCOMPRESSED type is not implemented yet!
          default:
            // return undefined;
            throw new Error('Unknown type');
        }
      case TEXT:
        const binaryText = bytesToText(byteStringToBytes(this.readBinary(value)));

        return this.cacheObject(binaryText);
      case BIN:
        const binary = this.readBinary(value);
        const byteArray = byteStringToBytes(binary);
        const parsedValue = this.cacheObject(byteArray);

        return byteArray;
      case LIST:
        const list = [];
        this.cacheObject(list);
        const listIndex = this.cache.length - 1;

        for (let i = 0; i < value; i++)
          list.push(this.get());

        this.cache[listIndex] = list;
        return list;
      case DICT:
        const dictionary = {};
        this.cacheObject({});
        const dictIndex = this.cache.length - 1;

        for (let i = 0; i < value; i++) {
          const key = this.get();
          const value = this.get();

          dictionary[key] = value;
        }

        this.cache[dictIndex] = dictionary;

        return dictionary;
      case CREF:
        return this.cache[value];
      default:
        throw new Error('Unknown type');
      // TODO: Implement TYPE_BIN section
    }
  }

  /**
   * Returns true if cache contains given object
   *
   * @param  {Array|Object}  obj
   * @return {Boolean}
   */
  isCachedObject(obj) {
    return this.cache.includes(obj);
  }

  /**
   * Adds given object into cache and returns it after.
   *
   * @param  {Array|Object|String} obj
   * @return {Array|Object|String} obj
   */
  cacheObject(obj) {
    this.cache.push(obj);

    return obj;
  }

  /**
   * Reads header and return code and value
   *
   * @return {Object} e.g. { code: 1, value: 2 }
   */
  readHeader() {
    const byte = this.readByte();

    const code = byte & 7;
    const value = byte >> 3;

    if (value < 23)
      return { code, value };
    else if (value < 32)
      return { code, value: this.readLongInt(value - 22) };
    else
      return { code, value: this.readLongInt(this.readSegment()) };
  }

  /**
   * Reads n-bytes long positive integer
   *
   * @return {Array}
   */
  readLongInt(length) {
    var result = 0;

    for (let m = 0, i = 0; i < length; i++, m += 8)
      result |= this.readByte() << m;

    return result;
  }

  /**
   * Reads variable-length positive integer
   *
   * @return {Number}
   */
  readSegment() {
    var byte;
    var value = new BigInteger('0');
    var i = 0;
    var bigByte;
    var big7f = new BigInteger((0x7f).toString());
    var big80 = new BigInteger((0x80).toString());

    while (typeof (byte = this.readByte()) === 'number') {
      bigByte = new BigInteger(byte.toString());
      value = value.or(bigByte.and(big7f).shiftLeft(i));

      if (bigByte.and(big80).toString(10) != 0) return value.toString(10);

      i += 7;
    }

    return value.toString(10);
  }

  readByte() {
    return ord(this.buffer.read(1));
  }

  readFloat() {
    const bytes = this.readBinary(4).split('').map(ord);
    return buffer.unpack('<f', bytes)[0];
  }

  readDouble() {
    const bytes = this.readBinary(8).split('').map(ord);
    return buffer.unpack('<d', bytes)[0];
  }

  readBinary(size) {
    return this.buffer.read(size);
  }
};
