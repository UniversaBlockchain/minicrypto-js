var forge = require('../vendor/forge');

var pki = forge.pki;

exports.encrypt = encrypt;
exports.decrypt = decrypt;

function decrypt(pem, password) {
  if (typeof password !== 'string') return pki.privateKeyFromPem(pem);

  return pki.decryptRsaPrivateKey(pem, password);
}

function encrypt(key, password) {
  if (typeof password !== 'string') return pki.privateKeyToPem(key);

  return pki.encryptRsaPrivateKey(privateKey, password);
}
