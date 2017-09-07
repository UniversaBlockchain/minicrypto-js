const forge = require('./vendor/forge');
const { Buffer } = require('buffer');

const { util, jsbn } = forge;
const { BigInteger } = jsbn;

const { bytesToHex } = util;

const { base64, raw } = util.binary;

exports.raw = raw;
exports.randomBytes = forge.random.getBytesSync;
exports.bytesToHex = bytesToHex;
exports.hexToBytes = util.hexToBytes;

exports.decode64 = base64.decode;
exports.encode64 = base64.encode;

exports.textToHex = textToHex;

exports.BigInteger = BigInteger;

exports.bigNumToBin = num => Buffer.from(num.toByteArray());
exports.binToBigNum = bin => new BigInteger(bytesToHex(bin), 16);
exports.byteStringToBin = str => Buffer.from(raw.decode(str));

function textToHex(text) {
  var result = [];

  for (var n = 0, len = text.length; n < len; n ++)
    result.push(Number(text.charCodeAt(n)).toString(16));

  return result.join('');
}
