const bytes = require('./bytes');
const { Buffer } = require('buffer');

// const encode64 = (byteArr) => base64.encode(bytes.ensureBytes(byteArr));
const encode64 = (byteArr) => (Buffer.from(byteArr)).toString('base64');
const decode64 = (base64Str) =>
  bytes.bufferToArray(Buffer.from(base64Str, 'base64'));

const encode64Short = (byteArr) => encode64(byteArr).replace(/=/g, '');
const decode64Short = decode64;

module.exports = {
  encode64,
  decode64,
  encode64Short,
  decode64Short
};
