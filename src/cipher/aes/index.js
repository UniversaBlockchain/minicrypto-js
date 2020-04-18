const AES = require('./vendor');
const utils = require('../../utils');

module.exports = AESCipher;

/**
 * Creates AES cipher by key and mode (default mode ECB)
 *
 * @param {String} key - (in bytes) 16 bytes for AES 128, 32 bytes for AES 256
 * @param {String} mode - cipher mode (ECB for ex.)
 */
function AESCipher(key, mode) {
  if (!mode) mode = 'ecb';

  this.cipher = new AES.ModeOfOperation[mode.toLowerCase()](key);
}

/**
 * Encrypts message
 *
 * @param {String} bytes - message in bytes to encrypt
 */
AESCipher.prototype.encrypt = function(bytes) {
  return this.cipher.encrypt(bytes);
};

/**
 * Decrypts message
 *
 * @param {String} encrypted - (in bytes) encrypted message to encrypt
 */
AESCipher.prototype.decrypt = function(encrypted) {
  return this.cipher.decrypt(encrypted);
};
