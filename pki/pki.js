var forge = require('../vendor/forge');

function PKI(type) {
  var lib = forge.pki[type];
}

PKI.createKeys = function (opts, callback) {
  if (typeof opts === 'function') callback = opts, opts = {};

  opts = opts || {};
  opts.bits = opts.bits || 2048;


};
