const forge = require('../vendor/forge');
const bytes = require('./bytes');
const base58 = require('./base58');
const base64 = require('./base64');
const idGenerators = require('./id_generators');
const crc32 = require('../hash/CRC32');
const SHA = require('../hash/SHA');

const { jsbn } = forge;

const { BigInteger } = jsbn;

crc32.bytes = (data) => bytes.hexToBytes((new BigInteger(crc32(data) + '', 10)).toString(16));
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
exports.byteStringToHex = bytes.bytesToHex;
exports.arrayToByteString = bytes.arrayToByteString;

exports.hexToBytes = bytes.hexToBytes;
exports.bytesToHex = bytes.bytesToHex;
exports.textToBytes = bytes.textToBytes;
exports.randomBytes = bytes.randomBytes;

//--------------------------------------------------------------

exports.encode64 = base64.encode64;
exports.decode64 = base64.decode64;
exports.encode58 = base58.encode;
exports.decode58 = base58.decode;
