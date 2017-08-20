var forge = require('./vendor/forge');

var util = forge.util;

var base64 = util.binary.base64;
var raw = util.binary.raw;

exports.randomBytes = forge.random.getBytesSync;
exports.bytesToHex = forge.util.bytesToHex;
exports.hexToBytes = forge.util.hexToBytes;

exports.decode64 = decode64;
exports.encode64 = forge.util.binary.base64.encode;

exports.textToHex = textToHex;

exports.BigInteger = forge.jsbn.BigInteger;

function textToHex(text) {
  var result = [];

  for (var n = 0, len = text.length; n < len; n ++)
    result.push(Number(text.charCodeAt(n)).toString(16));

  return result.join('');
}

function decode64(encoded) {
  var byteArray = base64.decode(encoded);

  return raw.encode(byteArray);
}
