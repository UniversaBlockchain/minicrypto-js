var forge = require('../vendor/forge');
var Hash = require('./hash');

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

  this.forgeMD.start(this.hash._getForgeMD(), this.key);
};
