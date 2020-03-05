const SHA = require('../hash/sha');
const forge = require('../vendor/forge');
const worker = require('../vendor/worker');
const PublicKey = require('./public_key');
const PrivateKey = require('./private_key');

const { rsa } = forge.pki;

/**
 * Creates RSA key pair
 *
 * @param {Number} bits - the size for the private key in bits, (default: 2048)
 * @param {Number} e - the public exponent to use, (default: 65537 (0x10001))
 * @param {String} workerScript - the worker script URL
 * @param {Function} callback
 */
function createKeys(options, callback) {
  var workerURL = '';

  if (typeof Blob !== 'undefined') {

    var blob = new Blob([worker], { type: "application/javascript" });
    workerURL = URL.createObjectURL(blob);
  }

  options.workerScript = workerURL;

  rsa.generateKeyPair(options, function(err, pair) {
    if (err) return callback(err);

    callback(null, {
      privateKey: new PrivateKey('FORGE', pair.privateKey),
      publicKey: new PublicKey('FORGE', pair.publicKey)
    });
  });
}

exports.createKeys = createKeys;

exports.createPrivateKey = function createPrivateKey(bits, exponent, callback) {
  var opts = { e: exponent, bits: bits };
  createKeys(opts, function(err, pair) {
    if (err) return callback(err);

    callback(null, pair.privateKey);
  });
};

exports.keysEqual = function keysEqual(key1, key2) {
  const { n: n1, e: e1 } = key1.params;
  const { n: n2, e: e2 } = key2.params;

  return n1.equals(n2) && e1.equals(e2);
};

exports.defaultPSSConfig = () => ({
  pssHash: new SHA("3_384"),
  mgf1Hash: new SHA("1")
});
