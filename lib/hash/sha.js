const forge = require('../vendor/forge');
const gost = require('../vendor/gost');
const sha3 = require('../vendor/sha3');
const sha512 = require('../vendor/sha512');

const Hash = require('./hash');
const utils = require('../utils');

module.exports = SHA;

var localMapping = {
  '512/256': sha512.sha512_256,
  '3_256': sha3.sha3_256,
  'KECCAK': sha3.keccak256
};

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

  if (['512/256', '3_256', 'KECCAK'].includes(type)) { 
  	var instance = localMapping[type].create();
  	var empty = true;

  	return {
  		get: function(data, format) { 
  			if (empty) instance.update(data);
  			else format = data;

  			var hexValue = instance.hex();
  			return format == 'hex' ? hexValue : forge.util.hexToBytes(hexValue);
  		},
  		put: function(data) {
  			empty = false;
  			instance.update(data);
  		}
  	};
  }

  Hash.call(this, type);
}

SHA.prototype = Object.create(Hash.prototype);

SHA.prototype._init = function() {
  this.forgeMD = forge.md['sha' + this.type].create();
};
