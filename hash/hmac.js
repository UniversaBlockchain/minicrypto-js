var forge = require('../vendor/forge');
var Hash = require('./hash');
var helpers = require('./helpers');

var getValue = helpers.getValue;

module.exports = HMAC;

function HMAC(md, key) {
  this.md = md;
  this.key = key;

  Hash.apply(this, arguments);
}

HMAC.prototype = Object.create(Hash.prototype);

HMAC.prototype._init = function() {
  this.forgeMD = forge.hmac.create();

  this.forgeMD.start(this.md._getForgeMD(), this.key);
};

HMAC.prototype._get = function(format) {
  return getValue.call(this, format);
};

HMAC.prototype._put = function(data) {
  this.forgeMD.update(data);
};
