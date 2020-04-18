const SHA = require('../hash/sha');
const utils = require('../utils');

const { arrayToByteString } = utils;

exports.wrapOptions = wrapOptions;
exports.getMaxSalt = getMaxSalt;
exports.normalizeOptions = normalizeOptions;
exports.mapCall = (fn, context, ...args) => {
  let res;

  fn.apply(context, args.concat([result => res = result]));

  return res;
}

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
  const hashesKeys = ['mgf1Hash', 'oaepHash', 'pssHash'];
  const normalizedOptions = {};
  const optionKeys = Object.keys(options);
  const optionsTotal = optionKeys.length;

  for (let i = 0; i < optionsTotal; i++) {
    const optionKey = optionKeys[i];
    if (hashesKeys.indexOf(optionKey) !== -1)
      normalizedOptions[optionKey] = getHash(options[optionKey]);
    else
      normalizedOptions[optionKey] = options[optionKey];
  }

  return normalizedOptions;
}
/**
 * Converts options to forge format
 *
 * @param {Object} options - rsa key methods options
 */
function wrapOptions(options = {}) {
  const shouldCopy = ['seed', 'salt', 'saltLength'];
  const converted = {};

  const normalizedOpts = normalizeOptions(options);

  const mgfHash = (normalizedOpts.mgf1Hash || new SHA('1'))._getForgeMD();

  converted.mgf = forge.mgf.mgf1.create(mgfHash);

  var wrappedMD = normalizedOpts.oaepHash || normalizedOpts.pssHash || new SHA('1');
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
