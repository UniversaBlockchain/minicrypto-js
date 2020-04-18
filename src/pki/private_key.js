var Module = Module || require('../vendor/wasm/wrapper');

const Boss = require('../boss/protocol');
const utils = require('../utils');
const helpers = require('./helpers');
const PublicKey = require('./public_key');
const SHA = require('../hash/sha');
const HMAC = require('../hash/hmac');
const pbkdf2 = require('./pbkdf2');
const cipher = require('../cipher');
const AbstractKey = require('./abstract_key');
const SymmetricKey = require('./symmetric_key');
const KeyInfo = require('./key_info');
const ExtendedSignature = require('./extended_signature');

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
const { wrapOptions, getMaxSalt, normalizeOptions } = helpers;

// const transit = {
//   BOSS: {
//     pack: toBOSS,
//     unpack: fromBOSS
//   },

//   EXPONENTS: {
//     pack: toExponents,
//     unpack: fromExponents
//   }
// };

module.exports = class PrivateKey extends AbstractKey {
  constructor(key) {
    super();

    this.key = key;
    this.publicKey = PublicKey.fromPrivate(key);
  }

  delete() {
    this.key.delete();
  }

  getN() { return this.publicKey.getN(); }
  getE() { return this.publicKey.getE(); }
  getP() { return this.key.get_p(); }
  getQ() { return this.key.get_q(); }
  getBitStrength() { return this.publicKey.getBitStrength(); }
  get fingerprint() {
    return this.publicKey.fingerprint;
  }
  async sign(data, options = {}) {
    const self = this;
    const hashType = SHA.wasmType(options.pssHash || 'sha1');
    const mgf1Type = SHA.wasmType(options.mgf1Hash || 'sha1');
    let saltLength = -1;
    if (typeof options.saltLength === 'number') saltLength = options.saltLength;

    return new Promise(resolve => {
      const cb = res => resolve(new Uint8Array(res));

      if (options.salt)
        self.key.signWithCustomSalt(data, hashType, mgf1Type, salt, cb);
      else
        self.key.sign(data, hashType, mgf1Type, saltLength, cb);
    });
  }

  async signExtended(data) {
    const self = this;
    const pub = this.publicKey;
    const dataHash = new SHA('512');
    const fingerprint = pub.fingerprint;
    const sha512Digest = await dataHash.get(data);
    const publicPacked = await pub.packed();
    const boss = new Boss();
    const targetSignature = boss.dump({
      'key': fingerprint,
      'sha512': sha512Digest,
      'created_at': new Date(),
      'pub_key': publicPacked
    });


    const signature = await self.sign(targetSignature, {
      pssHash: 'sha512',
      mgf1Hash: 'sha1'
    });

    return boss.dump({
      'exts': targetSignature,
      'sign': signature
    });
  }

  async decrypt(data, options = {}) {
    const self = this;
    const oaepHash = SHA.wasmType(options.oaepHash || 'sha1');

    return new Promise(resolve => {
      self.key.decrypt(data, oaepHash, (res) => {
        resolve(new Uint8Array(res));
      });
    });
  }

  async pack(options) {
    return this.packBOSS(options);
  }

  async packBOSS(options) {
    const self = this;

    return new Promise(resolve => {
      if (!options)
        self.key.pack(bin => resolve(new Uint8Array(bin)));
      else {
        const password = options.password || options;
        const rounds = options.rounds || 160000;

        self.key.packWithPassword(password, rounds, (err, packed) => {
          if (err === '') resolve(new Uint8Array(packed));
          else reject(err);
        });
      }
    });
  }

  static async unpack(options) {
    if (options.q && options.p)
      return new PrivateKey(await this.unpackExponents(options));

    return new PrivateKey(await this.unpackBOSS(options));
  }

  static async unpackBOSS(options) {
    const self = this;

    return new Promise(resolve => {
      if (!options.password) return resolve(new Module.PrivateKeyImpl(options));

      const { bin, password } = options;

      Module.PrivateKeyImpl.unpackWithPassword(bin, password, (err, key) => {
        if (err === "") resolve(key);
        else reject(err);
      });
    });
  }

  static async unpackExponents(options) {
    const boss = new Boss();
    const { e, p, q } = options;

    return this.unpackBOSS(boss.dump([
      AbstractKey.TYPE_PRIVATE,
      bigIntToByteArray(new BigInteger(e, 16)),
      bigIntToByteArray(new BigInteger(p, 16)),
      bigIntToByteArray(new BigInteger(q, 16))
    ]));
  }

  static async generate(options) {
    const { strength } = options;

    return new Promise(resolve => {
      Module.PrivateKeyImpl.generate(strength, key =>
        resolve(new PrivateKey(key))
      );
    });
  }
}

// module.exports = class PrivateKey extends AbstractKey {
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
//     const { n, e, d, p, q, dP, dQ, qInv } = key;

//     this.publicKey = new PublicKey('EXPONENTS', { n, e });
//     this.params = { n, e, d, p, q, dP, dQ, qInv };
//   }

//   /**
//    * Creates PSS signature for hashed message
//    *
//    * @param {Hash} hash - instance of hash that contains message
//    * @param {Number} [options.saltLength] - length of salt if salt wasn't provided
//    * @param {String} [options.salt] - salt (in bytes)
//    * @param {Hash} [options.mgf1Hash] - hash instance for MGF (SHA1 by default)
//    * @param {Hash} [options.pssHash] - hash instance for PSS (SHA1 by default)
//    *
//    * @return {String} (in bytes) signature
//    */
//   sign(message, options = {}) {
//     const normalizedOpts = normalizeOptions(options);

//     const hash = normalizedOpts.pssHash = normalizedOpts.pssHash || new SHA(256);
//     hash.put(message);

//     if (!normalizedOpts.salt && !normalizedOpts.saltLength) {
//       const digestLength = typeof hash.digestLength === "number" ?
//         hash.digestLength : hash.digestLength();

//       normalizedOpts.saltLength = getMaxSalt(this.getBitStrength(), digestLength);
//     }

//     const pss = forge.pss.create(wrapOptions(normalizedOpts));

//     return byteStringToArray(this.key.sign(hash._getForgeMD ? hash._getForgeMD() : hash, pss));
//   }

  // signExtended(data) {
  //   const self = this;
  //   const pub = this.publicKey;
  //   const boss = new Boss();
  //   const dataHash = new SHA('512');

  //   const targetSignature = boss.dump({
  //     'key': pub.fingerprint(),
  //     'sha512': dataHash.get(data),
  //     'created_at': new Date(),
  //     'pub_key': pub.pack('BOSS')
  //   });

  //   return boss.dump({
  //     'exts': targetSignature,
  //     'sign': self.sign(targetSignature, {
  //       pssHash: new SHA(512),
  //       mgf1Hash: new SHA(1)
  //     })
  //   });
  // }

//   getBitStrength() { return this.key.n.bitLength(); }

//   /**
//    * Decrypts OAEP encoded data
//    *
//    * @param {String} bytes - (in bytes) encrypted data
//    * @param {Hash} [options.mgf1] - hash instance for MGF (SHA1 by default)
//    * @param {Hash} [options.hash] - hash instance for OAEP (SHA1 by default)
//    */
//   decrypt(bytes, options) {
//     return byteStringToArray(this.key.decrypt(bytes, 'RSA-OAEP', wrapOptions(options)));
//   }

//   pack(type, options) {
//     return transit[type].pack(this, options);
//   }

//   static fromFile(file, callback) {
//     if (!file) return callback(new Error('No file provided'));

//     const reader = new FileReader();
//     reader.onload = e => callback(null, new PrivateKey('BOSS', e.target.result));
//     reader.readAsBinaryString(file);
//   }

//   static unpack(bytes, password) {
//     if (!password) return new PrivateKey("BOSS", bytes);

//     return new PrivateKey("BOSS", { bin: bytes, password });
//   }
// }

// /**
//  * Decrypts password-protected key
//  *
//  * @param {String} options.password - password for decrypt
//  * @param {Uint8Array} options.encodedBinary - encoded key binary
//  */
// function fromPassword(options) {
//   const { encodedBinary, password } = options;


// }

// function toPassword(instance, password) {
//   const packed = toBOSS(instance);


// }

// /**
//  * Converts PEM-formatted key protected via password to an instance
//  *
//  * @param {String} options.pem - pem formatted key
//  * @param {String} options.password - password for a key
//  */
// function fromPEM(options) {
//   const { pem, password } = options;

//   if (typeof password !== 'string') return pki.privateKeyFromPem(pem);

//   return pki.decryptRsaPrivateKey(pem, password);
// }

// /**
//  * Converts an RSA private key to PEM format.
//  *
//  * @return the PEM-foramatted public key.
//  */
// function toPEM(instance, password) {
//   const { key } = instance;

//   if (typeof password !== 'string') return pki.privateKeyToPem(key);

//   return pki.encryptRsaPrivateKey(key, password);
// }

// function fromForge(key) {
//   return key;
// }

// function toForge(instance) {
//   const { key } = instance;

//   return key;
// }

// function toFile(instance) {
//   const bossEncoded = toBOSS(instance);

//   if (typeof Blob === 'undefined') return bossEncoded;

//   const bytes = byteStringToArray(bossEncoded);

//   return new Blob([bytes], { type: 'application/octet-stream' });
// }

function toBOSS(instance, options) {
  if (options) return toBOSSPassword(instance, options);

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

// function toBOSSPassword(instance, options) {
//   var password = options;
//   var rounds = 160000;

//   if (typeof options === "object" && options) {
//     password = options.password;
//     rounds = options.rounds || rounds;
//   }

//   const boss = new Boss();
//   const packedKey = toBOSS(instance);

//   const keyInfo = new KeyInfo({
//     algorithm: KeyInfo.Algorithm.AES256,
//     prf: KeyInfo.PRF.HMAC_SHA256,
//     rounds,
//     salt: randomBytes(12),
//     tag: null
//   });

//   const keyBytes = keyInfo.derivePassword(password);
//   const key = new SymmetricKey({ keyBytes, keyInfo });

//   return boss.dump([
//     AbstractKey.TYPE_PRIVATE_PASSWORD_V2,
//     keyInfo.pack(),
//     key.etaEncrypt(packedKey)
//   ]);
// }

function fromBOSS(dump) {
  if (dump.password) return fromBOSSPassword(dump);
  // Module.onRuntimeInitialized = () => {
  //   console.log(Module.PrivateKeyImpl);
  //   return new Module.PrivateKeyImpl(dump);
  // };
  return new Module.PrivateKeyImpl(dump);
}

// function fromBOSSPassword(options) {
//   const { bin, password } = options;
//   const boss = new Boss();
//   const parts = boss.load(bin);

//   if (parts[0] == AbstractKey.TYPE_PRIVATE_PASSWORD_V2)
//     return fromBOSSPasswordV2(options);

//   const keyBytes = pbkdf2(new SHA(256), {
//     "password": password,
//     "salt": parts[2],
//     "iterations": parts[1],
//     "keyLength": 32
//   });

//   const encrypted = parts[4];

//   // decrypt symmetric
//   const iv = encrypted.slice(0, 16);
//   const transformed = encrypted.slice(16, encrypted.length);
//   const transformer = new AESCTRTransformer(keyBytes, iv);
//   const packed = transformer.transform(transformed);

//   return fromBOSS(packed);
// }

// function fromBOSSPasswordV2(options) {
//   const { bin, password } = options;
//   const boss = new Boss();
//   const parts = boss.load(bin);

//   const keyInfo = KeyInfo.fromBOSS(parts[1]);
//   const keyBytes = keyInfo.derivePassword(password);
//   const key = new SymmetricKey({ keyBytes, keyInfo });

//   const packed = key.etaDecrypt(parts[2]);

//   return fromBOSS(packed);
// }

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
