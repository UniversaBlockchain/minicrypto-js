const Boss = require('../boss/protocol');
const SHA = require('../hash/sha');
const pbkdf2 = require('./pbkdf2');

const { encode64 } = require('../utils/base64');
const { textToHex, hexToBytes } = require('../utils');

const PRF = {
  None: 0,
  HMAC_SHA1: 1,
  HMAC_SHA256: 2,
  HMAC_SHA512: 3
};

const Algorithm = {
  UNKNOWN: 0,
  RSAPublic: 1,
  RSAPrivate: 2,
  AES256: 3
};

class KeyInfo {
  constructor(params) {
    this.algorithm = params.algorithm;
    if (!this.algorithm) throw new Error("KeyInfo: no algorithm");

    // Uint8Array
    this.tag = params.tag || null;

    this.keyLength = params.keyLength;
    if (this.algorithm == Algorithm.AES256 && !this.keyLength)
      this.keyLength = 32;

    if (!this.keyLength) throw new Error("KeyInfo: no keyLength");

    this.prf = params.prf || PRF.None;
    this.rounds = params.rounds;

    this.salt = params.salt || null;

    if (this.isPassword() && !this.salt)
      this.salt = hexToBytes(textToHex("attesta"));
  }

  pack() {
    const writer = new Boss.writer();
    const algorithm = this.algorithm;

    if (typeof algorithm !== "number")
      throw new Error("KeyInfo: unknown algorithm");

    if (typeof this.prf !== "number")
      this.prf = PRF.None;

    writer.write(algorithm);
    writer.write(this.tag);
    writer.write(this.prf);
    writer.write(this.keyLength);

    if (this.isPassword()) {
      writer.write(0);
      writer.write(this.rounds);
    }

    writer.write(this.salt);

    return writer.get();
  }

  matchType(otherInfo) {
    if (this.keyLength !== otherInfo.keyLength) return false;

    const isAlgorithmEqual = otherInfo.algorithm === this.algorithm;
    if (isAlgorithmEqual && this.algorithm !== Algorithm.RSAPublic) return true;

    const isPrivate = this.algorithm === Algorithm.RSAPrivate;
    if (isPrivate && otherInfo.algorithm === Algorithm.RSAPublic) return true;

    return false;
  }

  matchTag(otherInfo) {
    if (this.tag === null || otherInfo.tag === null) return false;

    return encode64(this.tag) === encode64(otherInfo.tag);
  }

  toString() {
    var tagString = this.tag === null ? "null" : encode64(this.tag);

    if (this.isPassword())
      return `PBKDF2(${PRF[this.prf]},${this.rounds}), ${this.algorithm}, tag=${tagString} kLength=${this.keyLength}`;

    return `${this.algorithm}, tag=${tagString} kLength=${this.keyLength}`;
  }

  derivePassword(password) {
    if (!this.isPassword()) throw new Error("KeyInfo: not the PRF keyInfo");
    var md;

    switch(this.prf) {
      case PRF.HMAC_SHA1:
        md = new SHA(1);
        break;
      case PRF.HMAC_SHA256:
        md = new SHA(256);
        break;
      case PRF.HMAC_SHA512:
        md = new SHA(512);
        break;
      default:
        throw new Error("KeyInfo: unknown hash scheme for pbkdf2")
    }

    return pbkdf2(md, {
      password,
      salt: this.salt,
      rounds: this.rounds,
      keyLength: this.keyLength
    });
  }

  getSalt() { return this.salt; }
  getTag() { return this.tag; }
  setTag(tag) { this.tag = tag; }
  isPassword() { return this.prf !== PRF.None; }

  static fromBOSS(encoded) {
    const reader = new Boss.reader(encoded);

    const algorithm = reader.read();
    const tag = reader.read();
    const prf = reader.read();
    const keyLength = reader.read();
    const pbkdfType = reader.read();
    if (pbkdfType !== 0) throw new Error("KeyInfo: unknown PBKDF type");
    const rounds = reader.read();
    const salt = reader.read();

    return new KeyInfo({
      algorithm,
      tag,
      keyLength,
      prf,
      rounds,
      salt
    });
  }

  static unpack(encoded) { return KeyInfo.fromBOSS(encoded); }
}

KeyInfo.PRF = PRF;
KeyInfo.Algorithm = Algorithm;

module.exports = KeyInfo;
