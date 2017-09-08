const forge = require('../vendor/forge');
const SHA = require('../hash/sha');

exports.wrapOptions = wrapOptions;
exports.MAX_SALT_LENGTH = 490;

/**
 * Converts options to forge format
 *
 * @param {Object} options - rsa key methods options
 */
function wrapOptions(options = {}) {
  const shouldCopy = ['seed', 'salt', 'saltLength'];
  const converted = {};

  const mgfHash = (options.mgf1 || new SHA('1'))._getForgeMD();

  converted.mgf = forge.mgf.mgf1.create(mgfHash);
  converted.md = (options.hash || new SHA('1'))._getForgeMD();

  shouldCopy.forEach(prop => {
    if(options[prop]) converted[prop] = options[prop];
  });

  return converted;
}
