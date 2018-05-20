const DEFAULT_FORMAT = 'bytes';
const FORMAT_MAPPING = {
  'hex': 'toHex',
  'bytes': 'bytes'
};

const forge = require('../vendor/forge');
const raw = forge.util.binary.raw;
const bytesToArray = raw.decode;

module.exports = Hash;

/**
 * Returns instance of hash func
 *
 * @param {String} type - type of hash
 */
function Hash(type) {
  this.type = type;
  this.empty = true;

  this._init();
}

// should be implemented by subclass
Hash.prototype._init = function() {};

/**
 * Get's current hash value, or instantly returns hash for message
 *
 * @param {String} [data] - data for instant hash
 * @param {String} [format] - format of output (bytes, hex)
 */
Hash.prototype.get = function(data, format) {
  var hash = this;

  if (!format && !hash.empty) format = data, data = null;

  format = format || DEFAULT_FORMAT;

  if (!data) return hash._get(format);

  hash.put(data);

  return hash._get(format);
};

/**
 * Puts portion of data to hash func
 *
 * @param {String} data - portion of data to put
 */
Hash.prototype.put = function(data) {
  this._put(data);

  this.empty = false;
};

/**
 * Returns hash value by specific format
 *
 * @param {String} format - format of output (hex, bytes)
 */
Hash.prototype._byFormat = function(format) {
  var method = FORMAT_MAPPING[format];
  var digest = this.forgeMD.digest();

  var value = digest[method]();
  if (format == 'bytes' && typeof value == "string")
    return bytesToArray(value);
  return value;
};

Hash.prototype._put = function(data) {
  this.forgeMD.update(typeof data == 'object' ? arrayToBytes(data) : data);
};

Hash.prototype._get = function(format) {
  return this._byFormat(format);
};

Hash.prototype._getForgeMD = function() {
  return this.forgeMD;
};

Hash.prototype.digestLength = function() {
  return this.forgeMD.digestLength;
}

function arrayToBytes(list, offset = 10000) {
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
