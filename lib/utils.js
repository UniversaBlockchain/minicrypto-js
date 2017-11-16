const forge = require('./vendor/forge');
const { Buffer } = require('buffer');

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

exports.bigNumToBin = num => Buffer.from(num.toByteArray());
exports.binToBigNum = bin => new BigInteger(bytesToHex(bin), 16);
exports.byteStringToBin = bytesToBuffer;
exports.bytesToBuffer = bytesToBuffer;
exports.arrayToBuffer = bin => Buffer.from(bin);


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
