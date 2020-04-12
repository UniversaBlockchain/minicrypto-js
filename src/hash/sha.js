var Module = Module || require('../vendor/wasm/wrapper');

const { bytesToHex } = require('../utils/bytes');

const StringTypes = {
  "sha1": 0,
  "sha256": 1,
  "sha512": 2,
  "sha3_256": 3,
  "sha3_384": 4,
  "sha3_512": 5
};

class SHA {
  constructor(hashType) {
    this.hash = new Module.DigestImpl(StringTypes[`sha${hashType}`] || hashType);
    this.empty = true;
  }

  delete() {
    this.hash.delete();
  }

  update(data) {
    this.empty = false;
    this.hash.update(data);
  }

  put(data) {
    this.update(data);
  }

  doFinal() {
    this.hash.doFinal();
  }

  getDigestSize() {
    return this.hash.getDigestSize();
  }

  async getDigest(encoding) {
    const self = this;

    return new Promise((resolve, reject) => {
      self.hash.getDigest(res => {
        const bytes = new Uint8Array(res);

        if (encoding === 'hex') resolve(bytesToHex(bytes));
        else resolve(bytes);
      });
    });
  }

  async get(data, encoding) {
    if (typeof data !== 'string' || this.empty) this.update(data);
    else encoding = data;

    // if (data) this.update(data);

    this.doFinal();
    return this.getDigest(encoding);
  }

  static hashId(data) {
    return new Promise(resolve => {
      Module.calcHashId(data, res => resolve(new Uint8Array(res)));
    });
  }

  static wasmType(stringType) { return SHA.StringTypes[stringType.toLowerCase()]; }
}

SHA.StringTypes = StringTypes;

module.exports = SHA;
