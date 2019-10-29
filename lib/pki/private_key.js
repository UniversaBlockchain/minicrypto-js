const Boss = require('../boss/protocol');
const utils = require('../utils');
const forge = require('../vendor/forge');
const helpers = require('./helpers');
const PublicKey = require('./public_key');
const SHA = require('../hash/sha');
const HMAC = require('../hash/hmac');
const pbkdf2 = require('./pbkdf2');
const cipher = require('../cipher');
const AbstractKey = require('./abstract_key');
const SymmetricKey = require('./symmetric_key');
const KeyInfo = require('./key_info');

const {
  BigInteger,
  bigIntToByteArray,
  byteArrayToBigInt,
  byteStringToArray,
  randomBytes,
  concatBytes,
  crc32,
  textToHex,
  hexToBytes,
  encode64
} = utils;

const { AESCTRTransformer } = cipher;

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

module.exports = class PrivateKey extends AbstractKey {
  /**
   * Creates an RSA private key from specific format
   *
   * @param {Object} type - input format (PEM, BOSS, FORGE, EXPONENTS)
   * @param {String} options - format specific options
   *
   * @return the private key.
   */
  constructor(type, options) {
    super();

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
   * @param {Hash} [options.mgf1Hash] - hash instance for MGF (SHA1 by default)
   * @param {Hash} [options.pssHash] - hash instance for PSS (SHA1 by default)
   *
   * @return {String} (in bytes) signature
   */
  sign(message, options = {}) {
    const hash = options.pssHash = options.pssHash || new SHA(256);
    hash.put(message);

    if (!options.salt && !options.saltLength) {
      const digestLength = typeof hash.digestLength === "number" ?
        hash.digestLength : hash.digestLength();

      options.saltLength = getMaxSalt(this.getBitStrength(), digestLength);
    }

    const pss = forge.pss.create(wrapOptions(options));

    return byteStringToArray(this.key.sign(hash._getForgeMD ? hash._getForgeMD() : hash, pss));
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
    return byteStringToArray(this.key.decrypt(bytes, 'RSA-OAEP', wrapOptions(options)));
  }

  pack(type, options) {
    return transit[type].pack(this, options);
  }

  static fromFile(file, callback) {
    if (!file) return callback(new Error('No file provided'));

    const reader = new FileReader();
    reader.onload = e => callback(null, new PrivateKey('BOSS', e.target.result));
    reader.readAsBinaryString(file);
  }
}

/**
 * Decrypts password-protected key
 *
 * @param {String} options.password - password for decrypt
 * @param {Uint8Array} options.encodedBinary - encoded key binary
 */
function fromPassword(options) {
  const { encodedBinary, password } = options;


}

function toPassword(instance, password) {
  const packed = toBOSS(instance);


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
function toPEM(instance, password) {
  const { key } = instance;

  if (typeof password !== 'string') return pki.privateKeyToPem(key);

  return pki.encryptRsaPrivateKey(key, password);
}

function fromForge(key) {
  return key;
}

function toForge(instance) {
  const { key } = instance;

  return key;
}

function toFile(instance) {
  const bossEncoded = toBOSS(instance);

  if (typeof Blob === 'undefined') return bossEncoded;

  const bytes = byteStringToArray(bossEncoded);

  return new Blob([bytes], { type: 'application/octet-stream' });
}

function toBOSS(instance, password) {
  if (password) return toBOSSPassword(instance, password);

  const { key } = instance;

  const boss = new Boss();
  const { e, p, q } = key;

  return boss.dump([
    AbstractKey.TYPE_PRIVATE,
    bigIntToByteArray(e),
    bigIntToByteArray(p),
    bigIntToByteArray(q)
  ]);
}

function toBOSSPassword(instance, password) {
  const rounds = 160000;
  const boss = new Boss();
  const packedKey = toBOSS(instance);

  const keyInfo = new KeyInfo({
    algorithm: KeyInfo.Algorithm.AES256,
    prf: KeyInfo.PRF.HMAC_SHA256,
    rounds,
    salt: randomBytes(12),
    tag: null
  });

  const keyBytes = keyInfo.derivePassword(password);
  const key = new SymmetricKey({ keyBytes, keyInfo });

  return boss.dump([
    AbstractKey.TYPE_PRIVATE_PASSWORD_V2,
    keyInfo.pack(),
    key.etaEncrypt(packedKey)
  ]);
}

function fromBOSS(dump) {
  if (dump.password) return fromBOSSPassword(dump);

  const boss = new Boss();
  const parts = boss.load(dump);

  if (parts[0] !== AbstractKey.TYPE_PRIVATE)
    throw new Error('Failed to read key');

  return fromExponents({
    e: byteArrayToBigInt(parts[1]),
    p: byteArrayToBigInt(parts[2]),
    q: byteArrayToBigInt(parts[3])
  });
}

function fromBOSSPassword(options) {
  const { bin, password } = options;
  const boss = new Boss();
  const parts = boss.load(bin);

  if (parts[0] == AbstractKey.TYPE_PRIVATE_PASSWORD_V2)
    return fromBOSSPasswordV2(options);

  const keyBytes = pbkdf2(new SHA(256), {
    "password": password,
    "salt": parts[2],
    "iterations": parts[1],
    "keyLength": 32
  });

  const encrypted = parts[4];

  // decrypt symmetric
  const iv = encrypted.slice(0, 16);
  const transformed = encrypted.slice(16, encrypted.length);
  const transformer = new AESCTRTransformer(keyBytes, iv);
  const packed = transformer.transform(transformed);

  return fromBOSS(packed);
}

function fromBOSSPasswordV2(options) {
  const { bin, password } = options;
  const boss = new Boss();
  const parts = boss.load(bin);

  const keyInfo = KeyInfo.fromBOSS(parts[1]);
  const keyBytes = keyInfo.derivePassword(password);
  const key = new SymmetricKey({ keyBytes, keyInfo });

  const packed = key.etaDecrypt(parts[2]);

  return fromBOSS(packed);
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

function toExponents(instance) {
  return instance.params;
}
