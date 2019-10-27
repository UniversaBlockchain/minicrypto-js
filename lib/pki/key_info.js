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
    if (!this.keyLength) throw new Error("KeyInfo: no keyLength");

    this.prf = params.prf || PRF.None;
    this.rounds = params.rounds;
  }

  getSalt() { return this.salt; }
  getTag() { return this.tag; }
  setTag(tag) { this.tag = tag; }
  isPassword() { return this.prf !== PRF.None; }
}
