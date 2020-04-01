const forge = require('../vendor/forge');
const SHA = require('../hash/sha');
const utils = require('../utils');

const { arrayToByteString } = utils;

exports.wrapOptions = wrapOptions;
exports.getMaxSalt = getMaxSalt;
exports.normalizeOptions = normalizeOptions;

function getMaxSalt(emBits, hLen) {
	return parseInt((emBits + 7) / 8) - hLen - 2;
}

function getHash(hashType) {
  let hash;

  if (typeof hashType === "string") hash = SHA.createByStringType(hashType);
  else if (hashType) hash = hashType;

  return hash || hashType;
}

function normalizeOptions(options = {}) {
  const keys = ['mgf1Hash', 'oaepHash', 'pssHash'];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    options[key] = getHash(options[key]);
  }
}
/**
 * Converts options to forge format
 *
 * @param {Object} options - rsa key methods options
 */
function wrapOptions(options = {}) {
  const shouldCopy = ['seed', 'salt', 'saltLength'];
  const converted = {};

  normalizeOptions(options);

  const mgfHash = (options.mgf1Hash || new SHA('1'))._getForgeMD();

  converted.mgf = forge.mgf.mgf1.create(mgfHash);

  var wrappedMD = options.oaepHash || options.pssHash || new SHA('1');
  if (wrappedMD._getForgeMD) wrappedMD = wrappedMD._getForgeMD();
  converted.md = wrappedMD;

  shouldCopy.forEach(prop => {
    if (!options[prop]) return;

    converted[prop] = options[prop];

    if (converted[prop] instanceof Uint8Array)
      converted[prop] = arrayToByteString(converted[prop]);
  });

  return converted;
}
