const forge = require('../vendor/forge');
const gost = require('../vendor/gost');
const sha3 = require('../vendor/sha3');
const sha512 = require('../vendor/sha512');

const Hash = require('./hash');

const {
  byteStringToArray,
  arrayToByteString,
  hexToBytes
} = require('../utils/bytes');

module.exports = SHA;

const extra = {
  '512/256': {
    digestLength: 32,
    md: sha512.sha512_256
  },
  '3_256': {
    digestLength: 32,
    md: sha3.sha3_256
  },
  '3_384': {
    digestLength: 48,
    md: sha3.sha3_384
  },
  '3_512': {
    digestLength: 64,
    md: sha3.sha3_512
  },
  'KECCAK': {
    digestLength: 0,
    md: sha3.keccak256
  }
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

  if (extra[type]) {
  	var instance = extra[type].md.create();
  	var empty = true;

  	return {
  		get: function(data, format) {
  			if (empty) instance.update(data);
  			else format = data;

  			var hexValue = instance.hex();

        if (format === 'hex') return hexValue;

        return raw.decode(forge.util.hexToBytes(hexValue));
  		},
  		put: function(data) {
  			empty = false;
  			instance.update(data);
  		},
      start: function() {},
      update: function(data) {
        empty = false;
        instance.update(byteStringToArray(data));
      },
      digest: function() {
        const result = arrayToByteString(hexToBytes(instance.hex()));
        const buffer = new forge.util.ByteStringBuffer(result);

        return buffer;
      },
      digestLength: extra[type].digestLength
  	};
  }

  Hash.call(this, type);
}

SHA.hashId = function(data) {
  const gost = new SHA('GOST');
  const sha3_256 = new SHA('3_256');
  const sha512_256 = new SHA('512/256');

  var part1 = sha512_256.get(data);
  var part2 = sha3_256.get(data);
  var part3 = gost.get(data);
  var hashId = new Uint8Array(part1.length + part2.length + part3.length);
  hashId.set(part1, 0);
  hashId.set(part2, part1.length);
  hashId.set(part3, part1.length + part2.length);

  return hashId;
};

SHA.prototype = Object.create(Hash.prototype);

SHA.prototype._init = function() {
  this.forgeMD = forge.md['sha' + this.type].create();
};
