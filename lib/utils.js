const forge = require('./vendor/forge');
const { Buffer } = require('buffer');
const sha3 = require('./vendor/sha3');

const { util, jsbn } = forge;
const { BigInteger } = jsbn;

const { bytesToHex, hexToBytes } = util;

const { base64, raw } = util.binary;

const bytesToBuffer = str => Buffer.from(raw.decode(str));

exports.raw = raw;
exports.randomBytes = forge.random.getBytesSync;
exports.bytesToHex = bytesToHex;
exports.hexToBytes = hexToBytes;

exports.bytesToArray = raw.decode;
exports.arrayToBytes = arrayToBytes;

exports.decode64 = base64.decode;
exports.encode64 = base64.encode;

exports.textToHex = textToHex;

exports.BigInteger = BigInteger;

exports.shortId = function() {
  var letter, p;
  p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  letter = function(value) {
    return value + p[~~(Math.random() * p.length)];
  };
  return ['', '', '', '', '', ''].reduce(letter, '');
};

exports.guid = (function() {
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

exports.bigNumToBin = num => Buffer.from(num.toByteArray());
exports.binToBigNum = bin => new BigInteger(bytesToHex(bin), 16);
exports.byteStringToBin = bytesToBuffer;
exports.bytesToBuffer = bytesToBuffer;
exports.arrayToBuffer = bin => Buffer.from(bin);

exports.v2 = {
  decode64: (base64Str) => base64.decode(base64Str),
  encode64: (byteArr) => base64.encode(byteArr),
  shortId: function() {
    var letter, p;
    p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    letter = function(value) {
      return value + p[~~(Math.random() * p.length)];
    };
    return ['', '', '', '', '', ''].reduce(letter, '');
  }
};

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
