const forge = require('../vendor/forge');
const bytes = require('./bytes');

const { util, jsbn } = forge;

const { base64, raw } = util.binary;

exports.decode64 = (base64Str) => bytes.bufferToArray(Buffer.from(base64Str, 'base64'));
exports.encode64 = (byteArr) => base64.encode(bytes.ensureBytes(byteArr));
