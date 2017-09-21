const DEFAULT_FORMAT = 'bytes';
const FORMAT_MAPPING = {
  'hex': 'toHex',
  'bytes': 'bytes'
};

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

  if (typeof data !== 'string') return hash._get(format);

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

  return digest[method]();
};

Hash.prototype._put = function(data) {
  this.forgeMD.update(data);
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
