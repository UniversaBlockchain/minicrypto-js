var forge = require('../vendor/forge');

var pki = forge.pki;

exports.encrypt = encrypt;
exports.decrypt = decrypt;

function decrypt(pem) {
  return pki.publicKeyFromPem(pem);
}

function encrypt(key) {
  return pki.publicKeyToPem(key);
}
