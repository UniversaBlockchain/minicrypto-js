const forge = require('../vendor/forge');
const gost = require('../vendor/gost');
const sha3 = require('../vendor/sha3');
const sha512 = require('../vendor/sha512');

const Hash = require('./hash');

module.exports = SHA;

var localMapping = {
  '512/256': sha512.sha512_256,
  '3_256': sha3.sha3_256,
  '3_384': sha3.sha3_384,
  'KECCAK': sha3.keccak256
};

function arrayToBytes(list, offset = 10000) {
  const { raw } = forge.util.binary;
  const total = list.length;
  var cursor = 0;

  if (offset > total) return raw.encode(list);

  var result = '';

  for(cursor = 0; cursor < total; cursor += offset) {
    var start = cursor;
    var end = start + offset;
    if (end > total) end = total;

    result += raw.encode(list.subarray(start, end));
  }

  return result;
}

/**
 * Creates SHA type of hash function
 *
 * @param {String} type - type of SHA ('1', '256', '512' is supported)
 */
function SHA(type) {
  const { raw } = forge.util.binary;

	if (type === 'GOST') {
  	var cipher = new gost({ name: 'GOST R 34.11', version: 2012 });

  	return {
  		get: function(data, format) {
  			return new Buffer(cipher.digest(data));
  		}
  	}
  }

  if (localMapping[type]) {
  	var instance = localMapping[type].create();
  	var empty = true;

  	return {
  		get: function(data, format) {
  			if (empty) instance.update(data);
  			else format = data;

  			var hexValue = instance.hex();

  			return format == 'hex' ? hexValue : raw.decode(forge.util.hexToBytes(hexValue));
  		},
  		put: function(data) {
  			empty = false;
        // console.log("put", data);
        // console.log(arrayToBytes(data));
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
