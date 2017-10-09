const buffer = require('./struct');

const types = require('./types');
const StringIO = require('./stringio');

const { ord } = require('./helpers');

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
    this.buffer = new StringIO(source);

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
            const segm = this.readSegment();
            return new Date(segm * 1000);
            // TODO: TCOMPRESSED type is not implemented yet!
          default:
            throw new Error('Unknown type');
        }
      case TEXT:
      case BIN:
        const binary = this.readBinary(value);

        return this.cacheObject(binary);
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

    var value = 0;
    var i = 0;

    while (byte = this.readByte()) {
      value |= (byte & 0x7f) << i;

      if ((byte & 0x80) !== 0) return value;

      i += 7;
    }

    return value;
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