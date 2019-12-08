const forge = require('../vendor/forge');

const utils = require('../utils');

const { byteStringToArray, arrayToByteString } = utils;

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
 * @param {Function} [callback(err, key)] - presence triggers asynchronous
 *                                          version, called once the operation
 *                                          completes.
 *
 * @return the derived key, as a binary-encoded array of bytes, for the
 *           synchronous version (if no callback is specified).
 */
function derive(hash, options, callback) {
	const { password, salt, iterations, keyLength, rounds } = options;
  // FIXME: remove iterations
  const rnds = iterations || rounds;

	const forgeMD = hash._getForgeMD();
  const convertedSalt = salt && typeof salt === 'object' ? arrayToByteString(salt) : salt;

  if (!callback)
    return byteStringToArray(forge.pbkdf2(password, convertedSalt, rnds, keyLength, forgeMD));

  forge.pbkdf2(password, convertedSalt, rnds, keyLength, forgeMD, (err, key) => {
    if (err) return callback(err);

    callback(null, byteStringToArray(key));
  });
}
