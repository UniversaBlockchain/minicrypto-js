var forge = require('../vendor/forge');
var helpers = require('./helpers');
var utils = require('../utils');
var PublicKey = require('./public_key');

var BigInteger = utils.BigInteger;

var wrapOptions = helpers.wrapOptions;
var MAX_SALT_LENGTH = helpers.MAX_SALT_LENGTH;

var pki = forge.pki;
var rsa = pki.rsa;

module.exports = PrivateKey;

/**
 * Sets an RSA private key from BigIntegers modulus, exponent, primes,
 * prime exponents, and modular multiplicative inverse, or by pem format, or by
 * forge key
 *
 * @param {Object} key - forge private key
 *
 * @param {String} options.pem - pem formatted key
 * @param {String} options.password - password for pem formatted key
 *
 * @param {Number} [options.n] - the modulus.
 * @param {Number} options.e - the public exponent.
 * @param {Number} [options.d] - the private exponent ((inverse of e) mod n).
 * @param {Number} options.p - the first prime.
 * @param {Number} options.q - the second prime.
 * @param {Number} [options.dP] - exponent1 (d mod (p-1)).
 * @param {Number} [options.dQ] - exponent2 (d mod (q-1)).
 * @param {Number} [options.qInv] - ((inverse of q) mod p)
 *
 * @return the private key.
 */
function PrivateKey(options) {
  var key = options.key;

  var pem = options.pem;
  var password = options.password;

  if (key) this.key = key;
  if (pem) this.key = fromPEM(pem, password);

  var params = this.params = getParams(this.key, options);

  this.publicKey = new PublicKey({ n: params.n, e: params.e });

  if (!this.key) this.key = rsa.setPrivateKey(
    params.n,
    params.e,
    params.d,
    params.p,
    params.q,
    params.dP,
    params.dQ,
    params.qInv
  );
}

/**
 * Converts an RSA private key to PEM format.
 *
 * @return the PEM-foramatted public key.
 */
PrivateKey.prototype.toPEM = function(password) {
  if (typeof password !== 'string') return pki.privateKeyToPem(this.key);

  return pki.encryptRsaPrivateKey(this.key, password);
};

/**
 * Creates PSS signature for hashed message
 *
 * @param {Hash} hash - instance of hash that contains message
 * @param {Number} [options.saltLength] - length of salt if salt wasn't provided
 * @param {String} [options.salt] - salt (in bytes)
 * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
 * @param {Hash} [options.hash] - hash instance for PSS (SHA1 by default)
 *
 * @return {String} (in bytes) signature
 */
PrivateKey.prototype.sign = function(hash, options) {
  options = options || {};

  if (!options.salt && !options.saltLength)
    options.saltLength = MAX_SALT_LENGTH;

  var pss = forge.pss.create(wrapOptions(options));

  return this.key.sign(hash._getForgeMD(), pss);
};

/**
 * Decrypts OAEP encoded data
 *
 * @param {String} bytes - (in bytes) encrypted data
 * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
 * @param {Hash} [options.hash] - hash instance for OAEP (SHA1 by default)
 */
PrivateKey.prototype.decrypt = function(bytes, options) {
  return this.key.decrypt(bytes, 'RSA-OAEP', wrapOptions(options));
};

/**
 * Converts PEM-formatted key protected via password to an instance
 *
 * @param {String} pem - pem formatted key
 * @param {String} password - password for a key
 */
function fromPEM(pem, password) {
  if (typeof password !== 'string') return pki.privateKeyFromPem(pem);

  return pki.decryptRsaPrivateKey(pem, password);
}

/**
 * Restores private key exponents from e, p, q
 *
 * @param {Object} [key] - key
 * @param {Object} options - dict of exponents passed to private key
 */
function getParams(key, options) {
  key = key || {};
  var e = ensure('e');
  var p = ensure('p');
  var q = ensure('q');
  var one = BigInteger.ONE;

  var n = ensure('n') || p.multiply(q);

  var d = ensure('d') || e.modInverse(p.subtract(one).multiply(q.subtract(one)));

  var dP = ensure('dP') || d.mod(p.subtract(one));
  var dQ = ensure('dQ') || d.mod(q.subtract(one));
  var qInv = ensure('qInv') || q.modInverse(p);

  return {
    n: n,
    e: e,
    d: d,
    p: p,
    q: q,
    dP: dP,
    dQ: dQ,
    qInv: qInv
  };

  function ensure(prop) {
    return key[prop] || options[prop];
  }
}
