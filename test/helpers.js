const utils = require('../lib/utils');

const { raw, decode64, BigInteger, arrayToBytes } = utils;

exports.i = i;
exports.readKey64 = readKey64;

/**
 * Returns big integer parsed from hex string
 *
 * @param {String} hex - hex string with integer
 */
function i(hex) {
  return new BigInteger(hex, 16);
}

function readKey64(key64) {
	return arrayToBytes(decode64(key64));
}
