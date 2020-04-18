const { Buffer } = require('buffer');
const jsbn = require('jsbn');

const randomBytes = require('randombytes');

const { BigInteger } = jsbn;

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

const hexToBytes = (hexString) => Uint8Array.from(Buffer.from(hexString, 'hex'));
const bytesToHex = (data) => Buffer.from(data).toString('hex');

function textToHex(text) {
  var result = [];

  for (var n = 0, len = text.length; n < len; n ++)
    result.push(Number(text.charCodeAt(n)).toString(16));

  return result.join('');
}

exports.bigIntToBin = num => hexToBytes(num.toString(16));
exports.binToBigInt = bin => new BigInteger(bytesToHex(bin), 16);
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;
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

exports.byteStringToBytes = function(str, output, offset) {
  var out = output;
  if(!out) {
    out = new Uint8Array(str.length);
  }
  offset = offset || 0;
  var j = offset;
  for(var i = 0; i < str.length; ++i) {
    out[j++] = str.charCodeAt(i);
  }
  return output ? (j - offset) : out;
};

exports.bytesToByteString = (bytes) => String.fromCharCode.apply(null, bytes);

const bufferToArray = function(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
  }
  return view;
};

exports.bufferToArray = bufferToArray;

// const randomBytesBuffer = (
//   function() { // Browsers
//     var crypto = (self.crypto || self.msCrypto), QUOTA = 65536;
//     return function(n) {
//       var a = new Uint8Array(n);
//       for (var i = 0; i < n; i += QUOTA) {
//         crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, QUOTA)));
//       }
//       return a;
//     };
//   }
//     : function() { // Node
//         return require("crypto").randomBytes;
//       }
// )();

exports.randomBytes = randomBytes;
