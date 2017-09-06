const forge = require('../vendor/forge');
const helpers = require('./helpers');
const utils = require('../utils');
const Boss = require('../boss/protocol');

const { decode64, encode64, BigInteger, itob, btoi, bytesToHex, hexToBytes, raw } = utils;
const { pki } = forge;
const { rsa } = pki;

const { wrapOptions, MAX_SALT_LENGTH } = helpers;

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
  }

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
  verify(bytes, signature, options = {}) {
    if (!options.salt && !options.saltLength)
      options.saltLength = MAX_SALT_LENGTH;

    const pss = forge.pss.create(wrapOptions(options));

    return this.key.verify(bytes, signature, pss);
  }

  /**
   * Encrypts data with OAEP
   *
   * @param {String} bytes - (in bytes) original data
   * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
   * @param {Hash} [options.hash] - hash instance for OAEP (SHA1 by default)
   */
  encrypt(bytes, options) {
    return this.key.encrypt(bytes, 'RSA-OAEP', wrapOptions(options));
  }

  pack(type, options) {
    return transit[type].pack(this.key, options);
  }
}

/**
 * Converts PEM-formatted key protected via password to an instance
 *
 * @param {String} options.pem - pem formatted key
 */
function fromPEM(options) {

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

  return encode64(raw.decode(boss.dump([
    0,
    hexToBytes(n.toString(16)),
    hexToBytes(e.toString(16))
  ])));
}

function fromBOSS(dump) {
  const boss = new Boss();
  const bin = decode64(dump);
  const parts = boss.load(raw.encode(bin));

  if (parts[0] !== 0) throw new Error('Failed to read key');

  return fromExponents({
    n: new BigInteger(bytesToHex(parts[1]), 16),
    e: new BigInteger(bytesToHex(parts[2]), 16)
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
