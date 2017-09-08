const forge = require('../vendor/forge');
const worker = require('../vendor/worker');
const PrivateKey = require('./private_key');
const PublicKey = require('./public_key');

const { rsa } = forge.pki;

/**
 * Creates RSA key pair
 *
 * @param {Number} bits - the size for the private key in bits, (default: 2048)
 * @param {Number} e - the public exponent to use, (default: 65537 (0x10001))
 * @param {String} workerScript - the worker script URL
 * @param {Function} callback
 */
exports.createKeys = function createKeys(options, callback) {
  if (typeof Blob !== 'undefined') {
    var blob = new Blob([worker], {type: "application/javascript"});
    worker = URL.createObjectURL(blob);
  }

  options.workerScript = worker;

  rsa.generateKeyPair(options, function(err, pair) {
    if (err) return callback(err);

    callback(null, {
      privateKey: new PrivateKey('FORGE', pair.privateKey),
      publicKey: new PublicKey('FORGE', pair.publicKey)
    });
  });
};
