const forge = require('../vendor/forge');
const Hash = require('./hash');
const gost = require('./gost');
const utils = require('../utils');

module.exports = SHA;

/**
 * Creates SHA type of hash function
 *
 * @param {String} type - type of SHA ('1', '256', '512' is supported)
 */
function SHA(type) {
  if (type === 'GOST') {
  	var cipher = new gost({ name: 'GOST R 34.11', version: 2012 });
  	return {
  		get: function(data, format) {
  			return utils.arrayToBytes(new Buffer(cipher.digest(data)));
  		}
  	}
  }

  Hash.call(this, type);
}

SHA.prototype = Object.create(Hash.prototype);

SHA.prototype._init = function() {
  this.forgeMD = forge.md['sha' + this.type].create();
};
