var forge = require('../vendor/forge');
var worker = require('../vendor/worker');
var PrivateKey = require('./private_key');
var PublicKey = require('./public_key');

var rsa = forge.pki.rsa;

/**
 * Creates RSA key pair
 *
 * @param {Number} bits - the size for the private key in bits, (default: 2048)
 * @param {Number} e - the public exponent to use, (default: 65537 (0x10001))
 * @param {String} workerScript - the worker script URL
 * @param {Function} callback
 */
exports.createKeys = function createKeys(options, callback) {
  options.workerScript = worker;

  rsa.generateKeyPair(options, function(err, keypair) {
    if (err) return callback(err);

    var privateKey = new PrivateKey('FORGE', keypair.privateKey);
    var publicKey = new PublicKey('FORGE', keypair.publicKey);

    callback(null, {
      privateKey: privateKey,
      publicKey: publicKey
    });
  });
};
