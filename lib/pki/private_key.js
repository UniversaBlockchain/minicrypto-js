const Boss = require('../boss/protocol');
const utils = require('../utils');
const forge = require('../vendor/forge');
const helpers = require('./helpers');
const PublicKey = require('./public_key');

const {
  BigInteger,
  bigNumToBin,
  binToBigNum,
  encode64,
  decode64,
  raw
} = utils;

const { ONE: one } = BigInteger;
const { wrapOptions, getMaxSalt } = helpers;

const { pki, rsa } = forge;

const transit = {
  PEM: {
    pack: toPEM,
    unpack: fromPEM
  },

  BOSS: {
    pack: toBOSS,
    unpack: fromBOSS
  },

  FORGE: {
    pack: toForge,
    unpack: fromForge
  },

  EXPONENTS: {
    pack: toExponents,
    unpack: fromExponents
  },

  FILE: {
    pack: toFile
  }
};

module.exports = class PrivateKey {
  /**
   * Creates an RSA private key from specific format
   *
   * @param {Object} type - input format (PEM, BOSS, FORGE, EXPONENTS)
   * @param {String} options - format specific options
   *
   * @return the private key.
   */
  constructor(type, options) {
    const key = this.key = transit[type].unpack(options);
    const { n, e, d, p, q, dP, dQ, qInv } = key;

    this.publicKey = new PublicKey('EXPONENTS', { n, e });
    this.params = { n, e, d, p, q, dP, dQ, qInv };
  }

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
  sign(hash, options = {}) {
    if (!options.salt && !options.saltLength)
      options.saltLength = getMaxSalt(this.getBitStrength(), hash.digestLength());

    const pss = forge.pss.create(wrapOptions(options));

    return this.key.sign(hash._getForgeMD(), pss);
  }

  getBitStrength() { return this.key.n.bitLength(); }

  /**
   * Decrypts OAEP encoded data
   *
   * @param {String} bytes - (in bytes) encrypted data
   * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
   * @param {Hash} [options.hash] - hash instance for OAEP (SHA1 by default)
   */
  decrypt(bytes, options) {
    return this.key.decrypt(bytes, 'RSA-OAEP', wrapOptions(options));
  }

  pack(type, options) {
    return transit[type].pack(this.key, options);
  }

  static fromFile(file, callback) {
    if (!file) return callback(new Error('No file provided'));

    const reader = new FileReader();
    reader.onload = e => callback(null, new PrivateKey('BOSS', e.target.result));
    reader.readAsBinaryString(file);
  }
}

/**
 * Converts PEM-formatted key protected via password to an instance
 *
 * @param {String} options.pem - pem formatted key
 * @param {String} options.password - password for a key
 */
function fromPEM(options) {
  const { pem, password } = options;

  if (typeof password !== 'string') return pki.privateKeyFromPem(pem);

  return pki.decryptRsaPrivateKey(pem, password);
}

/**
 * Converts an RSA private key to PEM format.
 *
 * @return the PEM-foramatted public key.
 */
function toPEM(key, password) {
  if (typeof password !== 'string') return pki.privateKeyToPem(key);

  return pki.encryptRsaPrivateKey(key, password);
}

function fromForge(key) {
  return key;
}

function toForge(key) {
  return key;
}

function toFile(key) {
  const bossEncoded = toBOSS(key);

  if (typeof Blob === 'undefined') return bossEncoded;

  const bytes = raw.decode(bossEncoded);

  return new Blob([bytes], { type: 'application/octet-stream' });
}

function toBOSS(key) {
  const boss = new Boss();
  const { e, p, q } = key;

  return boss.dump([
    0,
    bigNumToBin(e),
    bigNumToBin(p),
    bigNumToBin(q)
  ]);
}

function fromBOSS(dump) {
  const boss = new Boss();
  const parts = boss.load(dump);

  if (parts[0] !== 0) throw new Error('Failed to read key');

  return fromExponents({
    e: binToBigNum(parts[1]),
    p: binToBigNum(parts[2]),
    q: binToBigNum(parts[3])
  });
}

/**
 * Restores private key exponents from e, p, q
 *
 * @param {Object} exps - dict of exponents passed to private key.
 *                             Exponents must be in BigInteger format
 */
function fromExponents(exps) {
  const { e, p, q } = exps;

  const n = exps.n || p.multiply(q);
  const d = exps.d || e.modInverse(p.subtract(one).multiply(q.subtract(one)));
  const dP = exps.dP || d.mod(p.subtract(one));
  const dQ = exps.dQ || d.mod(q.subtract(one));
  const qInv = exps.qInv || q.modInverse(p);

  return rsa.setPrivateKey(n, e, d, p, q, dP, dQ, qInv);
}

function toExponents(key) {
  return key.params;
}
