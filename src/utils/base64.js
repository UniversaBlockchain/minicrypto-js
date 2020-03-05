const bytes = require('./bytes');
const forge = require('../vendor/forge');

const { util, jsbn } = forge;
const { base64, raw } = util.binary;

const encode64 = (byteArr) => base64.encode(bytes.ensureBytes(byteArr));
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
