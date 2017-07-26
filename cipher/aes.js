var forge = require('../vendor/forge');

var cipher = forge.cipher;
var util = forge.util;

module.exports = AES;

/**
 * Creates AES cipher by key and mode (default mode ECB)
 *
 * @param {String} key - (in bytes) 16 bytes for AES 128, 32 bytes for AES 256
 * @param {String} mode - cipher mode (ECB for ex.)
 */
function AES(key, mode) {
	if (!mode) mode = 'ECB';
	var type = ['AES', mode].join('-');

	this.cipher = cipher.createCipher(type, key);
	this.decipher = cipher.createDecipher(type, key);
}

/**
 * Encrypts message
 *
 * @param {String} bytes - message in bytes to encrypt
 */
AES.prototype.encrypt = function(bytes) {
	var cipher = this.cipher;

	cipher.start();
	cipher.update(util.createBuffer(bytes));
	cipher.finish();

	return cipher.output.bytes();
};

/**
 * Decrypts message
 *
 * @param {String} encrypted - (in bytes) encrypted message to encrypt
 */
AES.prototype.decrypt = function(encrypted) {
	var decipher = this.decipher;

	decipher.start();
	decipher.update(util.createBuffer(encrypted));
	var result = decipher.finish();

	if (!result) return new Error('Decryption failed');

	return decipher.output.bytes();
};
