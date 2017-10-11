const forge = require('../vendor/forge');
const helpers = require('./helpers');
const utils = require('../utils');
const Boss = require('../boss/protocol');
const SHA = require('../hash/sha');
const { Buffer } = require('buffer');

const FINGERPRINT_SHA512 = '07';

const {
  BigInteger,
  bigNumToBin,
  binToBigNum,
  decode64,
  encode64,
  itob,
  btoi,
  bytesToHex,
  hexToBytes,
  raw,
  byteStringToBin
} = utils;

const { pki } = forge;
const { rsa } = pki;

const { wrapOptions, getMaxSalt } = helpers;

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
  }
};

module.exports = class PublicKey {
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

    const { n, e } = key;

    this.params = { n, e };
    this._fingerprint = null;
  }

  getBitStrength() { return this.key.n.bitLength(); }

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
  verify(message, signature, options = {}) {
    const hash = options.pssHash;

    if (!options.salt && !options.saltLength)
      options.saltLength = getMaxSalt(this.getBitStrength(), hash.digestLength());


    const pss = forge.pss.create(wrapOptions(options));

    return this.key.verify(hash.get(message), signature, pss);
  }

  /**
   * Encrypts data with OAEP
   *
   * @param {String} bytes - (in bytes) original data
   * @param {Hash} [options.mgf1Hash] - hash instance for MGF (SHA1 by default)
   * @param {Hash} [options.oaepHash] - hash instance for OAEP (SHA1 by default)
   */
  encrypt(bytes, options) {
    return this.key.encrypt(bytes, 'RSA-OAEP', wrapOptions(options));
  }

  pack(type, options) {
    return transit[type].pack(this.key, options);
  }

  fingerprint() {
    if (this._fingerprint) return this._fingerprint;

    const { n, e } = this.params;
    const sha256 = new SHA('256');

    sha256.put(hexToBytes(e.toString(16)));
    sha256.put(hexToBytes(n.toString(16)));

    const hashedExponents = sha256.get('hex');

    this._fingerprint = hexToBytes(FINGERPRINT_SHA512 + hashedExponents);

    return this._fingerprint;
  }
}

/**
 * Converts PEM-formatted key protected via password to an instance
 *
 * @param {String} options.pem - pem formatted key
 */
function fromPEM(options) {
  // TODO: may be needed in future
}

/**
 * Converts an RSA public key to PEM format.
 *
 * @return the PEM-foramatted public key.
 */
function toPEM(key) {
  return pki.publicKeyToPem(key);
};

function fromForge(key) {
  return key;
}

function toForge(key) {
  return key;
}

function toBOSS(key) {
  const boss = new Boss();
  const { n, e } = key;

  return boss.dump([
    1,
    bigNumToBin(e),
    bigNumToBin(n)
  ]);
}

function fromBOSS(dump) {
  const boss = new Boss();
  const parts = boss.load(dump);

  if (parts[0] !== 1) throw new Error('Failed to read key');

  return fromExponents({
    e: binToBigNum(parts[1]),
    n: binToBigNum(parts[2])
  });
}

/**
 * Restores public key from exponents n, e
 *
 * @param {Object} exps - dict of exponents passed to public key.
 *                        Exponents must be in BigInteger format
 */
function fromExponents(exps) {
  const { n, e } = exps;

  return rsa.setPublicKey(n, e);
}

function toExponents(key) {
  return key.params;
}
