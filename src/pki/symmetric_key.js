const AbstractKey = require('./abstract_key');
const KeyInfo = require('./key_info');
const { randomBytes, concatBytes, encode64 } = require('../utils');
const { AESCTRTransformer } = require('../cipher');
const { HMAC, SHA } = require('../hash');

const IVSize = 16;

class SymmetricKey {
  constructor(params = {}) {
    const { keyBytes, keyInfo } = params;
    this.cipher = null;

    if (!keyBytes && !keyInfo) this.createRandom();
    else {
      this.keyBytes = keyBytes;
      this.keyInfo = keyInfo;
    }
  }

  createRandom() {
    this.keyBytes = randomBytes(32);
    this.keyInfo = new KeyInfo({
      algorithm: KeyInfo.Algorithm.AES256,
      tag: null,
      keyLength: 32
    });
  }

  static fromPassword(password, rounds, salt = null) {
    const ki = new KeyInfo({
      algorithm: KeyInfo.PRF.HMAC_SHA256,
      rounds,
      salt,
      tag: null,
      keyLength: 32
    });

    return new SymmetricKey({
      keyBytes: ki.derivePassword(password),
      keyInfo: ki
    });
  }

  getSize() { return this.keyBytes.length; }
  getBitStrength() { return this.getSize() * 8; }
  toString() { return `SymmetricKey(${encode64(this.keyBytes)})`; }
  pack() {
    if (!this.keyBytes)
      throw new Error("key is not yet initialized");
    return this.keyBytes;
  }

  decrypt(encrypted) {
    const iv = encrypted.slice(0, IVSize);
    const transformed = encrypted.slice(IVSize, encrypted.length);
    const transformer = new AESCTRTransformer(this.keyBytes, iv);

    return transformer.transform(transformed);
  }

  encrypt(data) {
    const iv = randomBytes(IVSize);
    const transformer = new AESCTRTransformer(this.keyBytes, iv);

    return concatBytes(iv, transformer.transform(data));
  }

  etaDecrypt(encrypted) {
    const encryptedLength = encrypted.length;
    const hmac = new HMAC(new SHA(256), this.keyBytes);
    const transformed = encrypted.slice(IVSize, encryptedLength - 32);
    const hmacCalculated = hmac.get(transformed);
    const hmacGiven = encrypted.slice(encryptedLength - 32, encryptedLength);
    if (encode64(hmacCalculated) !== encode64(hmacGiven))
      throw new Error("hmac digest doesn't match");

    return this.decrypt(encrypted.slice(0, encryptedLength - 32));
  }

  etaEncrypt(data) {
    const hmac = new HMAC(new SHA(256), this.keyBytes);
    const encrypted = this.encrypt(data);
    const hmacDigest = hmac.get(encrypted.slice(IVSize, encrypted.length));

    return concatBytes(encrypted, hmacDigest);
  }
}

module.exports = SymmetricKey;
