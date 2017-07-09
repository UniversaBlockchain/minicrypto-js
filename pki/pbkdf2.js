var forge = require('../vendor/forge');

exports.sync = function sync(password, salt, iterations, keyLength) {
  return forge.pbkdf2(password, salt, iterations, keyLength);
};

exports.async = runAsync;

function runAsync(password, salt, iterations, keyLength, callback) {
  if (!callback) return function(callback) {
    runAsync(password, salt, iterations, keyLength, callback);
  };

  forge.pbkdf2(password, salt, iterations, keyLength, callback);
}
