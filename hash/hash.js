var DEFAULT_FORMAT = 'hex';

module.exports = Hash;

function Hash(type) {
  this.type = type;
  this.empty = true;

  this._init();
}

// should be implemented by subclass
Hash.prototype._init = function() {};
Hash.prototype._put = function(data) {};
Hash.prototype._get = function(format) {};

Hash.prototype.get = function(data, format) {
  var hash = this;
  if (!format && !hash.empty) format = data, data = null;

  format = format || DEFAULT_FORMAT;

  if (typeof data !== 'string') return hash._get(format);

  hash.put(data);

  return hash._get(format);
};

Hash.prototype.put = function(data) {
  this._put(data);
  this.empty = false;
};
