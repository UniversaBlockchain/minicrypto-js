var Module = Module || require('../vendor/wasm/wrapper');

const SHA = require('./SHA');

class HMAC {
  /**
   * Returns instance of HMAC message digest function
   *
   * @param {Hash} hash - hash instance, for example SHA256
   * @param {String} key - key to use with HMAC
   */
  constructor(hashStringType, key) {
    this.hashType = SHA.wasmType(hashStringType);
    this.key = key;
  }

  async get(data) {
    const self = this;

    return new Promise((resolve, reject) => {
      Module.calcHmac(self.hashType, self.key, data, res => {
        resolve(new Uint8Array(res));
      });
    });
  }
}

module.exports = HMAC;
