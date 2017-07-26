var forge = require('../vendor/forge');

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
 * @return the derived key, as a binary-encoded string of bytes, for the
 *           synchronous version (if no callback is specified).
 */
function derive(hash, options, callback) {
  var password = options.password;
  var salt = options.salt;
  var iterations = options.iterations;
  var keyLength = options.keyLength;
  var forgeMD = hash._getForgeMD();

  if (!callback)
    return forge.pbkdf2(password, salt, iterations, keyLength, forgeMD);

  forge.pbkdf2(password, salt, iterations, keyLength, forgeMD, callback);
}
