const forge = require('../vendor/forge');
const helpers = require('./helpers');
const utils = require('../utils');
const Boss = require('../boss/protocol');
const SHA = require('../hash/sha');
const { Buffer } = require('buffer');

const FINGERPRINT_SHA512 = '07';

const {
  BigInteger,
  bigIntToByteArray,
  byteArrayToBigInt,

  decode58,
  encode58,

  hexToBytes,
  byteStringToArray,
  arrayToByteString,
  crc32
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
    const hash = options.pssHash = options.pssHash || new SHA(256);

    if (!options.salt && !options.saltLength)
      options.saltLength = getMaxSalt(this.getBitStrength(), hash.digestLength());


    const pss = forge.pss.create(wrapOptions(options));

    return this.key.verify(arrayToByteString(hash.get(message)), signature, pss);
  }

  /**
   * Encrypts data with OAEP
   *
   * @param {String} bytes - (in bytes) original data
   * @param {Hash} [options.mgf1Hash] - hash instance for MGF (SHA1 by default)
   * @param {Hash} [options.oaepHash] - hash instance for OAEP (SHA1 by default)
   */
  encrypt(bytes, options) {
    return byteStringToArray(this.key.encrypt(arrayToByteString(bytes), 'RSA-OAEP', wrapOptions(options)));
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

  address(options = {}) {
    const shaType = options.long ? 384 : 256;
    const shaLength = shaType === 384 ? 48 : 32;

    const hash = new SHA('3_' + shaType);
    const typeMark = options.typeMark || 0;
    const bits = this.params.n.bitLength();
    const keyMask = bits === 2048 ? 0x01 : 0x02;
    const firstByte = ((keyMask << 4) | typeMark) & 0xFF;
    const result = new Uint8Array(1 + 4 + shaLength);
    result.set([firstByte]);

    const modulus = bigIntToByteArray(this.params.n);
    const exponent = bigIntToByteArray(this.params.e);

    hash.put(exponent);
    hash.put(modulus);
    const hashed = hash.get();

    result.set(hashed, 1);

    var checksum = crc32(result.slice(0, 1 + shaLength));

    if (checksum.length < 4) {
      var buf = new Uint8Array(new ArrayBuffer(4));
      buf.set(checksum, 4 - checksum.length);
      checksum = buf;
    }

    result.set(checksum.slice(0, 4), 1 + shaLength);

    return result;
  }

  shortAddress() { return this.address(); }
  longAddress() { return this.address({ long: true }); }

  static isValidAddress(address) {
    var decoded;

    try {
      decoded = decode58(address);
    } catch (err) { return false; }

    if ([37, 53].indexOf(decoded.length) == -1) return false;
    if ([16, 32].indexOf(decoded[0]) == -1) return false;

    var shaLength = 48;
    if (decoded.length == 37) shaLength = 32;

    var hashed = decoded.slice(0, 1 + shaLength);

    var checksum = crc32(hashed);

    if (checksum.length < 4) {
      var buf = new Uint8Array(new ArrayBuffer(4));
      buf.set(checksum, 4 - checksum.length);
      checksum = buf;
    }

    var decodedLength = decoded.length;
    var decodedPart = decoded.slice(decodedLength - 4, decodedLength);

    var isValid = encode58(checksum.slice(0, 4)) == encode58(new Uint8Array(decodedPart));

    return isValid;
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
    bigIntToByteArray(e),
    bigIntToByteArray(n)
  ]);
}

function fromBOSS(dump) {
  const boss = new Boss();
  const parts = boss.load(dump);

  if (parts[0] !== 1) throw new Error('Failed to read key');

  return fromExponents({
    e: byteArrayToBigInt(parts[1]),
    n: byteArrayToBigInt(parts[2])
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
