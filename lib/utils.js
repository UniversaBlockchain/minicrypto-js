const forge = require('./vendor/forge');
const { Buffer } = require('buffer');
const SHA = require('./hash/sha');
const crc32bin = require('./hash/CRC32');

const { util, jsbn } = forge;
const { BigInteger } = jsbn;

const { bytesToHex } = util;

const { base64, raw } = util.binary;
const bytesToBuffer = str => Buffer.from(raw.decode(str));
const hexToBytes = (data) => raw.decode(util.hexToBytes(data));
const textToBytes = (text) => Buffer.from(hexToBytes(textToHex(text)));
const ensureBytes = (bytes) => {
  return bytes.constructor.name == 'Array' ? new Uint8Array(bytes) : bytes;
}

exports.ensureBytes = ensureBytes;
exports.raw = raw;
exports.randomBytes = forge.random.getBytesSync;
exports.bytesToHex = bytesToHex;
exports.hexToBytes = hexToBytes;

exports.bytesToArray = raw.decode;
exports.arrayToBytes = arrayToBytes;

exports.decode64 = (base64Str) => bufferToArray(Buffer.from(base64Str, 'base64'));
exports.encode64 = (byteArr) => base64.encode(ensureBytes(byteArr));

exports.textToHex = textToHex;
exports.textToBytes = textToBytes;

exports.BigInteger = BigInteger;

exports.hashId = hashId;

exports.shortId = function() {
  var letter, p;
  p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  letter = function(value) {
    return value + p[~~(Math.random() * p.length)];
  };
  return ['', '', '', '', '', ''].reduce(letter, '');
};

const guid = (function() {
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  return function (len, radix) {
    var chars = CHARS, uuid = [];
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (var i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };
})();

exports.guid = guid;

exports.bigNumToBin = num => hexToBytes(num.toString(16));
exports.binToBigNum = bin => new BigInteger(bytesToHex(bin), 16);
exports.byteStringToBin = bytesToBuffer;
exports.bytesToBuffer = bytesToBuffer;
exports.arrayToBuffer = bin => Buffer.from(bin);

function bufferToArray(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
  }
  return view;
}

exports.v2 = {
  decode64: (base64Str) => bufferToArray(Buffer.from(base64Str, 'base64')),
  encode64: (byteArr) => base64.encode(ensureBytes(byteArr)),
  shortId: function() {
    var letter, p;
    p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    letter = function(value) {
      return value + p[~~(Math.random() * p.length)];
    };
    return ['', '', '', '', '', ''].reduce(letter, '');
  },
  hashId,
  uuid: guid,
  asByteString: arrayToBytes,
  asByteArray: raw.decode,
  randomBytes: function(len) {
    return raw.decode(forge.random.getBytesSync(len));
  },
  textToBytes,
  bufferToBytes: function(arrayBuf) { new Uint8Array(arrayBuf); }
};

const base58 = (function() {
  var ALPHABET, ALPHABET_MAP, Base58, i;
  ALPHABET = void 0;
  ALPHABET_MAP = void 0;
  Base58 = void 0;
  i = void 0;
  new Function('x', 'Base58 = x;')(Base58 = {});
  ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  ALPHABET_MAP = {};
  i = 0;
  while (i < ALPHABET.length) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i;
    i++;
  }
  Base58.encode = function(buffer) {
    var i;
    var carry, digits, j, l;
    carry = void 0;
    digits = void 0;
    j = void 0;
    if (buffer.length === 0) {
      return '';
    }
    i = void 0;
    j = void 0;
    digits = [0];
    i = 0;
    while (i < buffer.length) {
      j = 0;
      while (j < digits.length) {
        digits[j] <<= 8;
        j++;
      }
      digits[0] += buffer[i];
      carry = 0;
      j = 0;
      while (j < digits.length) {
        digits[j] += carry;
        carry = digits[j] / 58 | 0;
        digits[j] %= 58;
        ++j;
      }
      while (carry) {
        digits.push(carry % 58);
        carry = carry / 58 | 0;
      }
      i++;
    }
    i = 0;
    while (buffer[i] === 0 && i < buffer.length - 1) {
      digits.push(0);
      i++;
    }
    digits.reverse();
    i = 0;
    l = digits.length;
    while (i < l) {
      digits[i] = ALPHABET.charAt(digits[i]);
      ++i;
    }
    return digits.join('');
  };
  Base58.decode = function(string) {
    var bytes, c, carry, j;
    bytes = void 0;
    c = void 0;
    carry = void 0;
    j = void 0;
    if (string.length === 0) {
      return [];
    }
    i = void 0;
    j = void 0;
    bytes = [0];
    i = 0;
    while (i < string.length) {
      c = string[i];
      if (!(c in ALPHABET_MAP)) {
        throw 'Base58.decode received unacceptable input. Character \'' + c + '\' is not in the Base58 alphabet.';
      }
      j = 0;
      while (j < bytes.length) {
        bytes[j] *= 58;
        j++;
      }
      bytes[0] += ALPHABET_MAP[c];
      carry = 0;
      j = 0;
      while (j < bytes.length) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
        ++j;
      }
      while (carry) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
      i++;
    }
    i = 0;
    while (string[i] === '1' && i < string.length - 1) {
      bytes.push(0);
      i++;
    }
    return bytes.reverse();
  };
  return Base58;
}).call(this);

exports.v2.base58 = base58;
exports.v2.encode58 = base58.encode;
exports.v2.decode58 = base58.decode;

function hashId(data) {
  const gost = new SHA('GOST');
  const sha3_256 = new SHA('3_256');
  const sha512_256 = new SHA('512/256');

  var part1 = sha512_256.get(data);
  var part2 = sha3_256.get(data);
  var part3 = gost.get(data);
  var hashId = new Uint8Array(part1.length + part2.length + part3.length);
  hashId.set(part1, 0);
  hashId.set(part2, part1.length);
  hashId.set(part3, part1.length + part2.length);

  return hashId;
}

function arrayToBytes(list, offset = 10000) {
  const total = list.length;
  var cursor = 0;

  if (offset > total) return raw.encode(list);

  var result = '';

  for(cursor = 0; cursor < total; cursor += offset) {
    var start = cursor;
    var end = start + offset;
    if (end > total) end = total;

    result += raw.encode(list.subarray(start, end));
  }

  return result;
}

function textToHex(text) {
  var result = [];

  for (var n = 0, len = text.length; n < len; n ++)
    result.push(Number(text.charCodeAt(n)).toString(16));

  return result.join('');
}

function makeCRCTable() {
  var c, j, k, l, n;
  var crcTable = [];

  for (n = j = 0; j < 256; n = ++j) {
    c = n;
    for (k = l = 0; l < 8; k = ++l) {
      c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  return crcTable;
}

function int32ToBytes(val) {
  var b1, b2, b3, b4;
  b1 = val & 0xff;
  val >>= 8;
  b2 = val & 0xff;
  val >>= 8;
  b3 = val & 0xff;
  val >>= 8;
  b4 = val & 0xff;
  val >>= 8;
  return raw.decode(String.fromCharCode(b4, b3, b2, b1));
}

var crcTable = null;

function crc32(str) {
  var crc, i, j, ref;

  crcTable = crcTable || makeCRCTable();

  crc = 0 ^ (-1);
  for (i = j = 0, ref = str.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return int32ToBytes((crc ^ (-1)) >>> 0);
}



exports.v2.crc32 = crc32;
exports.v2.crc32BIN = function(bytes) {
  const digest = crc32(arrayToBytes(bytes));
  return digest;
}
