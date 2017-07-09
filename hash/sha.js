var forge = require('../vendor/forge');
var Hash = require('./hash');
var helpers = require('./helpers');

var getValue = helpers.getValue;

module.exports = SHA;

function SHA(type) {
  Hash.apply(this, arguments);
}

SHA.prototype = Object.create(Hash.prototype);

SHA.prototype._init = function() {
  this.forgeMD = forge.md['sha' + this.type].create();
};

SHA.prototype._get = function(format) {
  return getValue.call(this, format);
};

SHA.prototype._put = function(data) {
  this.forgeMD.update(data);
};

// FIXME: needed by forge's hmac
SHA.prototype._getForgeMD = function() {
  return this.forgeMD;
};
