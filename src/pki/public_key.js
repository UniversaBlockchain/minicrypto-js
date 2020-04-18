var Module = Module || require('../vendor/wasm/wrapper');

const helpers = require('./helpers');
const utils = require('../utils');
const Boss = require('../boss/protocol');
const SHA = require('../hash/sha');
const { Buffer } = require('buffer');
const AbstractKey = require('./abstract_key');

const FINGERPRINT_SHA512 = '07';

const {
  BigInteger,
  bigIntToByteArray,
  byteArrayToBigInt,

  decode58,
  encode58,
  encode64,

  hexToBytes,
  byteStringToArray,
  arrayToByteString,
  crc32
} = utils;

const { wrapOptions, getMaxSalt, normalizeOptions, mapCall } = helpers;

const transit = {
  KEY: {
    unpack: fromKey
  },

  BOSS: {
    pack: toBOSS,
    unpack: fromBOSS
  },

  EXPONENTS: {
    pack: toExponents,
    unpack: fromExponents
  }
};

module.exports = class PublicKey extends AbstractKey {
  constructor(key) {
    super();

    this.key = key;
  }

  delete() { this.key.delete(); }

  async verify(data, signature, options) {
    const self = this;
    const hashType = SHA.wasmType(options.pssHash || 'sha1');
    const mgf1Type = SHA.wasmType(options.mgf1Hash || 'sha1');
    let saltLength = -1;
    if (typeof options.saltLength === 'number') saltLength = options.saltLength;
    if (options.salt) saltLength = options.salt.length;


    return new Promise(resolve => {
      self.key.verify(data, signature, hashType, mgf1Type, saltLength, resolve);
    });
  }

  async verifyExtended(signature, data) {
    const boss = new Boss();
    const dataHash = new SHA('512');
    const unpacked = boss.load(signature);
    const { exts, sign } = unpacked;
    const verified = await this.verify(exts, sign, {
      pssHash: 'sha512'
    });

    if (!verified) return null;

    const targetSignature = boss.load(exts);
    const { sha512, key, created_at } = targetSignature;

    if (encode64(await dataHash.get(data)) === encode64(sha512))
      return { key, created_at };

    return null;
  }

  async encrypt(data, options = {}) {
    const { oaepHash, seed } = options;
    const self = this;
    const hashType = SHA.wasmType(oaepHash || 'sha1');

    return new Promise(resolve => {
      const cb = res => resolve(new Uint8Array(res));

      if (seed) self.key.encryptWithSeed(data, hashType, seed, cb);
      else self.key.encrypt(data, hashType, cb);
    });
  }

  get fingerprint() {
    if (this._fingerprint) return this._fingerprint;

    const self = this;
    this.key.fingerprint(fp => self._fingerprint = new Uint8Array(fp));

    return this._fingerprint;
  }

  async packed() {
    const self = this;

    if (this._packed) return this._packed;

    this._packed = await this.pack();

    return this._packed;
  }

  async pack() {
    const self = this;

    return new Promise(resolve => {
      self.key.pack(packed => resolve(new Uint8Array(packed)));
    });
  }

  encryptionMaxLength(options) {
    const mdHashType = options.pssHash || options.oaepHash || 'sha1';
    const md = new SHA(SHA.StringTypes[mdHashType]);
    const keyLength = this.getBitStrength() / 8;
    const maxLength = keyLength - 2 * md.getDigestSize() - 2;

    return maxLength;
  }

  getN() { return this.key.get_n(); }
  getE() { return this.key.get_e(); }
  getBitStrength() { return this.key.getBitStrength(); }

  get shortAddress58() { return this.key.getShortAddress58(); }
  get shortAddress() {
    return new Uint8Array(mapCall(this.key.getShortAddressBin, this.key));
  }

  get longAddress58() { return this.key.getLongAddress58(); }
  get longAddress() {
    return new Uint8Array(mapCall(this.key.getLongAddressBin, this.key));
  }

  static async unpack(options) {
    return new PublicKey(await PublicKey.unpackBOSS(options));
  }

  static async unpackBOSS(options) {
    const self = this;

    return new Promise(resolve => {
      Module.PublicKeyImpl.initFromPackedBinary(options, resolve);
    });
  }

  static fromPrivate(key) {
    return new PublicKey(new Module.PublicKeyImpl(key));
  }
}

// module.exports = class PublicKey extends AbstractKey {
//   /**
//    * Creates an RSA private key from specific format
//    *
//    * @param {Object} type - input format (PEM, BOSS, FORGE, EXPONENTS)
//    * @param {String} options - format specific options
//    *
//    * @return the private key.
//    */
//   constructor(type, options) {
//     super();

//     const key = this.key = transit[type].unpack(options);

//     const { n, e } = key;

//     this.params = { n, e };
//     this._fingerprint = null;
//   }

//   getBitStrength() { return this.key.n.bitLength(); }

//   /**
//    * Verifies PSS signature for message
//    *
//    * @param {String} bytes - (in bytes) signed message
//    * @param {String} signature - (in bytes) signature to verify
//    * @param {Number} [options.saltLength] - length of salt if salt wasn't provided
//    * @param {String} [options.salt] - salt (in bytes)
//    * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
//    * @param {Hash} [options.hash] - hash instance for PSS (SHA1 by default)
//    */
//   verify(message, signature, options = {}) {
//     const normalizedOpts = normalizeOptions(options);

//     const hash = normalizedOpts.pssHash = normalizedOpts.pssHash || new SHA(256);

//     if (!normalizedOpts.salt && !normalizedOpts.saltLength) {
//       const digestLength = typeof hash.digestLength === "number" ?
//         hash.digestLength : hash.digestLength();

//       normalizedOpts.saltLength = getMaxSalt(this.getBitStrength(), digestLength);
//     }

//     const pss = forge.pss.create(wrapOptions(normalizedOpts));

//     return this.key.verify(arrayToByteString(hash.get(message)), signature, pss);
//   }

  // verifyExtended(signature, data) {
  //   const boss = new Boss();
  //   const dataHash = new SHA('512');
  //   const unpacked = boss.load(signature);
  //   const { exts, sign } = unpacked;

  //   const verified = this.verify(exts, sign, {
  //     pssHash: new SHA(512),
  //     mgf1Hash: new SHA(1)
  //   });

  //   if (!verified) return null;

  //   const targetSignature = boss.load(exts);
  //   const { sha512, key, created_at } = targetSignature;

  //   if (encode64(dataHash.get(data)) === encode64(sha512))
  //     return { key, created_at };

  //   return null;
  // }

//   /**
//    * Encrypts data with OAEP
//    *
//    * @param {String} bytes - (in bytes) original data
//    * @param {Hash} [options.mgf1Hash] - hash instance for MGF (SHA1 by default)
//    * @param {Hash} [options.oaepHash] - hash instance for OAEP (SHA1 by default)
//    */
//   encrypt(bytes, options) {
//     return byteStringToArray(this.key.encrypt(arrayToByteString(bytes), 'RSA-OAEP', wrapOptions(options)));
//   }

//   encryptionMaxLength(options) {
//     const { md } = wrapOptions(options);
//     const keyLength = Math.ceil(this.key.n.bitLength() / 8);
//     const maxLength = keyLength - 2 * md.digestLength - 2;

//     return maxLength;
//   }

//   pack(type, options) { return transit[type].pack(this.key, options); }
//   get packed() { return this.pack("BOSS"); }

//   static get DEFAULT_MGF1_HASH() { return new SHA(1); }
//   static get DEFAULT_OAEP_HASH() { return new SHA(1); }

  // fingerprint() {
  //   if (this._fingerprint) return this._fingerprint;

  //   const { n, e } = this.params;
  //   const sha256 = new SHA('256');

  //   sha256.put(hexToBytes(e.toString(16)));
  //   sha256.put(hexToBytes(n.toString(16)));

  //   const hashedExponents = sha256.get('hex');

  //   this._fingerprint = hexToBytes(FINGERPRINT_SHA512 + hashedExponents);

  //   return this._fingerprint;
  // }

//   address(options = {}) {
//     const shaType = options.long ? 384 : 256;
//     const shaLength = shaType === 384 ? 48 : 32;

//     const hash = new SHA('3_' + shaType);
//     const typeMark = options.typeMark || 0;
//     const bits = this.params.n.bitLength();
//     const keyMask = bits === 2048 ? 0x01 : 0x02;
//     const firstByte = ((keyMask << 4) | typeMark) & 0xFF;
//     const result = new Uint8Array(1 + 4 + shaLength);
//     result.set([firstByte]);

//     const modulus = bigIntToByteArray(this.params.n);
//     const exponent = bigIntToByteArray(this.params.e);

//     hash.put(exponent);
//     hash.put(modulus);
//     const hashed = hash.get();

//     result.set(hashed, 1);

//     var checksum = crc32(result.slice(0, 1 + shaLength));

//     if (checksum.length < 4) {
//       var buf = new Uint8Array(new ArrayBuffer(4));
//       buf.set(checksum, 4 - checksum.length);
//       checksum = buf;
//     }

//     result.set(checksum.slice(0, 4), 1 + shaLength);

//     return result;
//   }

//   shortAddress() { return this.address(); }
//   longAddress() { return this.address({ long: true }); }

//   static isValidAddress(address) {
//     var decoded;

//     try {
//       decoded = decode58(address);
//     } catch (err) { decoded = address; }

//     if ([37, 53].indexOf(decoded.length) == -1) return false;
//     if ([16, 32].indexOf(decoded[0]) == -1) return false;

//     var shaLength = 48;
//     if (decoded.length == 37) shaLength = 32;

//     var hashed = decoded.slice(0, 1 + shaLength);

//     var checksum = crc32(hashed);

//     if (checksum.length < 4) {
//       var buf = new Uint8Array(new ArrayBuffer(4));
//       buf.set(checksum, 4 - checksum.length);
//       checksum = buf;
//     }

//     var decodedLength = decoded.length;
//     var decodedPart = decoded.slice(decodedLength - 4, decodedLength);

//     var isValid = encode58(checksum.slice(0, 4)) == encode58(new Uint8Array(decodedPart));

//     return isValid;
//   }

//   static unpack(bytes) { return new PublicKey("BOSS", bytes); }
// }

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

function fromKey(privateKey) {
  return new Module.PublicKeyImpl(privateKey);
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
