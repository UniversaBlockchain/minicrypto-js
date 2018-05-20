const forge = require('../vendor/forge');
const SHA = require('../hash/sha');
const utils = require('../utils');

const { arrayToBytes } = utils;

exports.wrapOptions = wrapOptions;
exports.getMaxSalt = getMaxSalt;

function getMaxSalt(emBits, hLen) {
	return parseInt((emBits + 7) / 8) - hLen - 2;
}
/**
 * Converts options to forge format
 *
 * @param {Object} options - rsa key methods options
 */
function wrapOptions(options = {}) {
  const shouldCopy = ['seed', 'salt', 'saltLength'];
  const converted = {};

  const mgfHash = (options.mgf1Hash || new SHA('256'))._getForgeMD();

  converted.mgf = forge.mgf.mgf1.create(mgfHash);
  converted.md = (options.oaepHash || options.pssHash || new SHA('256'))._getForgeMD();

  shouldCopy.forEach(prop => {
    if (!options[prop]) return;

    converted[prop] = options[prop];

    if (converted[prop] instanceof Uint8Array)
      converted[prop] = arrayToBytes(converted[prop]);
  });

  return converted;
}
