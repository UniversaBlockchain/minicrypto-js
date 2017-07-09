var forge = require('../vendor/forge');
var privateKey = require('./private_key');
var publicKey = require('./public_key');

var rsa = forge.pki.rsa;

module.exports = RSAProcessor;

function RSAProcessor(options) {
  options = options || {};

  this.OAEPOptions = options.OAEPOptions;
  this.publicKey = null;
  this.privateKey = null;
  this.workerScript = options.workerScript;
  this.pss = options.pss;
}

RSAProcessor.prototype.setPrivateKey = function(pem, password) {
  this.privateKey = privateKey.decrypt(pem, password);
};

RSAProcessor.prototype.setPublicKey = function(pem) {
  this.publicKey = publicKey.decrypt(pem);
};

RSAProcessor.prototype.getPrivateKey = function(password) {
  return privateKey.encrypt(this.privateKey, password);
};

RSAProcessor.prototype.getPublicKey = function() {
  return publicKey.encrypt(this.publicKey);
};

/**
 * Generates an RSA public-private key pair
 *
 * @param {Number} [bits] the size for the private key in bits, defaults to 2048
 * @param {Number} [e] the public exponent to use, defaults to 65537
 * @param {Function} callback
 *
 * @return an object with privateKey and publicKey properties into callback
 */
RSAProcessor.prototype.createKeys = function(options, callback) {
  var self = this;

  if (!options.workerScript) options.workerScript = this.workerScript;

  rsa.generateKeyPair(options, function(err, keypair) {
    if (err) return callback(err);

    self.publicKey = keypair.publicKey;
    self.privateKey = keypair.privateKey;

    callback(null, {
      publicKey: publicKey.encrypt(self.publicKey),
      privateKey: privateKey.encrypt(self.privateKey)
    });
  });
};

RSAProcessor.prototype.createPSS = function(options) {
  var pss = this.pss = forge.pss.create(options);

  return pss;
};

RSAProcessor.prototype.setOAEP = function(options) {
  this.OAEPOptions = options;
};

RSAProcessor.prototype.sign = function(md, pss) {
  pss = pss || this.pss;

  if (!pss) throw Error('Set PSS first');

  return this.privateKey.sign(md._getForgeMD(), pss);
};

RSAProcessor.prototype.verifySignature = function(bytes, signature, pss) {
  pss = pss || this.pss;

  if (!pss) throw Error('Set or provide PSS first');

  return this.publicKey.verify(bytes, signature, pss);
};

RSAProcessor.prototype.encryptOAEP = function(bytes, options) {
  options = options || this.OAEPOptions;

  if (!options) throw Error('Set or provide OAEP settings');

  var convertedOptions = convertOptions(options);

  return this.publicKey.encrypt(bytes, 'RSA-OAEP', convertedOptions);
};

RSAProcessor.prototype.decryptOAEP = function(encrypted, options) {
  options = options || this.OAEPOptions || {};

  if (!options) throw Error('Set or provide OAEP settings');

  var convertedOptions = convertOptions(options);

  return this.privateKey.decrypt(encrypted, 'RSA-OAEP', convertedOptions);
};

function convertOptions(options) {
  var converted = {};

  if (options.md) converted.md = options.md._getForgeMD();
  if (options.mgf1)
    converted.mgf = forge.mgf.mgf1.create(options.mgf1._getForgeMD());

  return converted;
}
