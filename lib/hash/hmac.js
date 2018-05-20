const forge = require('../vendor/forge');
const Hash = require('./hash');
const utils = require('../utils');

const { arrayToBytes } = utils;

module.exports = HMAC;

/**
 * Returns instance of HMAC message digest function
 *
 * @param {Hash} hash - hash instance, for example SHA256
 * @param {String} key - key to use with HMAC
 */
function HMAC(hash, key) {
  this.hash = hash;
  this.key = key;

  Hash.call(this, 'hmac');
}

HMAC.prototype = Object.create(Hash.prototype);

HMAC.prototype._init = function() {
  this.forgeMD = forge.hmac.create();

  var convertedKey = typeof this.key == 'object' ? arrayToBytes(this.key) : this.key;

  this.forgeMD.start(this.hash._getForgeMD(), convertedKey);
};
