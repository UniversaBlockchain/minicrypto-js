var forge = require('../vendor/forge');
var Hash = require('./hash');

module.exports = SHA;

/**
 * Creates SHA type of hash function
 *
 * @param {String} type - type of SHA ('1', '256', '512' is supported)
 */
function SHA(type) {
  Hash.call(this, type);
}

SHA.prototype = Object.create(Hash.prototype);

SHA.prototype._init = function() {
  this.forgeMD = forge.md['sha' + this.type].create();
};
