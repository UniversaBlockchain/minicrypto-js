const forge = require('node-forge');

// Monkey patch for large binaries
forge.util.binary.raw.encode = function(bytes) {
  return bytes.reduce(function (data, byte) {
    return data + String.fromCharCode(byte);
  }, '');
};

module.exports = forge;
