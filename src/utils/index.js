const jsbn = require('jsbn');
const bytes = require('./bytes');
const base58 = require('./base58');
const base64 = require('./base64');
const idGenerators = require('./id_generators');
const crc32 = require('../hash/crc32');
const SHA = require('../hash/sha');

const { BigInteger } = jsbn;

const engLower = "qwertyuiopasdfghjklzxcvbnm";
const idChars = (engLower + engLower.toUpperCase() + "_1234567890").split("");

crc32.bytes = (data) =>
  bytes.hexToBytes((new BigInteger(crc32(data) + '', 10)).toString(16));
//--------------------------------------------------------------

exports.hashId = SHA.hashId;
exports.guid = idGenerators.guid;
exports.shortId = idGenerators.shortId;

exports.crc32 = crc32.bytes;

exports.BigInteger = BigInteger;

//--------------------------------------------------------------

exports.bytes = bytes;

exports.bigIntToByteArray = bytes.bigIntToBin;
exports.byteArrayToBigInt = bytes.binToBigInt;

// internal use only
exports.byteStringToArray = bytes.byteStringToArray;
exports.arrayToByteString = bytes.arrayToByteString;

exports.hexToBytes = bytes.hexToBytes;
exports.bytesToHex = bytes.bytesToHex;
exports.textToBytes = bytes.textToBytes;
exports.bytesToText = bytes.bytesToText;
exports.byteStringToBytes = bytes.byteStringToBytes;
exports.bytesToByteString = bytes.bytesToByteString;
exports.textToHex = bytes.textToHex;
exports.randomBytes = bytes.randomBytes;

//--------------------------------------------------------------

exports.encode64 = base64.encode64;
exports.decode64 = base64.decode64;
exports.encode64Short = base64.encode64Short;
exports.decode64Short = base64.decode64Short;
exports.encode58 = base58.encode;
exports.decode58 = base58.decode;

exports.concatBytes = function(a, b) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
};

exports.randomAlnums = (size) => {
  const idCharsTotal = idChars.length;
  let result = "";

  for (let _i = 0; _i < size; _i++) {
    result += idChars[Math.floor(Math.random() * idCharsTotal)];
  }

  return result;
};
