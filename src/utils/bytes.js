const { Buffer } = require('buffer');
const forge = require('../vendor/forge');

const { util, jsbn } = forge;
const { BigInteger } = jsbn;
const { base64, raw } = util.binary;

const { bytesToHex } = util;

var window = window || {};

// nodejs polyfill
if (!window.TextDecoder || !window.TextEncoder) {
  const {
    TextEncoder,
    TextDecoder
  } = require("fastestsmallesttextencoderdecoder");
  // var window = window || {};
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
}

const hexToBytes = (data) => raw.decode(util.hexToBytes(data));

function textToHex(text) {
  var result = [];

  for (var n = 0, len = text.length; n < len; n ++)
    result.push(Number(text.charCodeAt(n)).toString(16));

  return result.join('');
}

exports.bigIntToBin = num => hexToBytes(num.toString(16));
exports.binToBigInt = bin => new BigInteger(bytesToHex(bin), 16);
exports.byteStringToArray = raw.decode;
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;

exports.arrayToByteString = function(list, offset = 10000) {
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
};

exports.textToHex = textToHex;



exports.textToBytes = (text) => {
  const te = new TextEncoder();

  return new Uint8Array(te.encode(text));
};
exports.bytesToText = (bytes) => {
  const td = new TextDecoder("utf-8");

  return td.decode(bytes);
};
exports.ensureBytes = (bytes) => {
  return bytes.constructor.name == 'Array' ? new Uint8Array(bytes) : bytes;
}

exports.bufferToArray = function(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
  }
  return view;
}

exports.randomByteString = forge.random.getBytesSync;
exports.randomBytes = function(len) {
  return raw.decode(forge.random.getBytesSync(len));
};
