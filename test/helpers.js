var utils = require('../lib/utils');

var BigInteger = utils.BigInteger;

exports.i = i;

/**
 * Returns big integer parsed from hex string
 *
 * @param {String} hex - hex string with integer
 */
function i(hex) {
  return new BigInteger(hex, 16);
}
