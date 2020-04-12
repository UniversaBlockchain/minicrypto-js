var Module = Module || require('../vendor/wasm/wrapper');

const SHA = require('../hash/SHA');

module.exports = derive;

/**
 * Derives a key from a password.
 *
 * @param {Hash} hash - hash instance
 * @param {String} options.password - the password as a binary-encoded string of
 *                                    bytes.
 * @param {String} options.salt - the salt as a binary-encoded string of bytes.
 * @param {Number} options.iterations - the iteration count, a positive integer.
 * @param {Number} options.keyLength - the intended length, in bytes, of the
 *                                     derived key, (max: 2^32 - 1) * hash
 *                                     length of the PRF.
 *
 * @return the derived key, as a binary-encoded array of bytes, for the
 *           synchronous version (if no callback is specified).
 */
async function derive(hashStringType, options) {
  const self = this;
  const hashType = SHA.StringTypes[hashStringType];

  return new Promise((resolve, reject) => {
    const { password, salt, keyLength, rounds } = options;
    const cb = (result) => resolve(new Uint8Array(result));

    Module.pbkdf2(hashType, rounds || 5000, keyLength, password, salt, cb);
  });
}
