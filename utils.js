var forge = require('./vendor/forge');

exports.randomBytes = forge.random.getBytesSync;
exports.bytesToHex = forge.util.bytesToHex;
exports.hexToBytes = forge.util.hexToBytes;
