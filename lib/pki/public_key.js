var forge = require('../vendor/forge');
var helpers = require('./helpers');

var pki = forge.pki;

var rsa = pki.rsa;

var wrapOptions = helpers.wrapOptions;
var MAX_SALT_LENGTH = helpers.MAX_SALT_LENGTH;

module.exports = PublicKey;

/**
 * Creates an RSA public key from BigIntegers modulus, exponent,
 * or by pem format, or by forge key
 *
 * @param {Object} [key] - forge public key
 *
 * @param {String} [options.pem] - pem formatted key
 *
 * @param {Number} [options.n] - the modulus.
 * @param {Number} [options.e] - the public exponent.
 *
 * @return the public key.
 */
function PublicKey(options) {
  var pem = options.pem;
  var key = options.key;

  if (key) this.key = key;
  if (pem) this.key = pki.publicKeyFromPem(pem);

  var params = this.params = {
    n: ensure('n'),
    e: ensure('e')
  };

  if (!this.key) this.key = rsa.setPublicKey(params.n, params.e);

  function ensure(prop) {
    return key && key[prop] || options[prop];
  }
}

/**
 * Converts an RSA public key to PEM format.
 *
 * @return the PEM-foramatted public key.
 */
PublicKey.prototype.toPEM = function() {
  return pki.publicKeyToPem(this.key);
};

/**
 * Verifies PSS signature for message
 *
 * @param {String} bytes - (in bytes) signed message
 * @param {String} signature - (in bytes) signature to verify
 * @param {Number} [options.saltLength] - length of salt if salt wasn't provided
 * @param {String} [options.salt] - salt (in bytes)
 * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
 * @param {Hash} [options.hash] - hash instance for PSS (SHA1 by default)
 */
PublicKey.prototype.verify = function(bytes, signature, options) {
  options = options || {};

  if (!options.salt && !options.saltLength)
    options.saltLength = MAX_SALT_LENGTH;

  var pss = forge.pss.create(wrapOptions(options));

  return this.key.verify(bytes, signature, pss);
};

/**
 * Encrypts data with OAEP
 *
 * @param {String} bytes - (in bytes) original data
 * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
 * @param {Hash} [options.hash] - hash instance for OAEP (SHA1 by default)
 */
PublicKey.prototype.encrypt = function(bytes, options) {
  return this.key.encrypt(bytes, 'RSA-OAEP', wrapOptions(options));
};
