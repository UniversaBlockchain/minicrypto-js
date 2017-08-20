var forge = require('../vendor/forge');
var hash = require('../hash');

var SHA = hash.SHA;

exports.wrapOptions = wrapOptions;
exports.MAX_SALT_LENGTH = 490;

/**
 * Converts options to forge format
 *
 * @param {Object} options - rsa key methods options
 */
function wrapOptions(options) {
  options = options || {};
  var toCopy = ['seed', 'salt', 'saltLength'];

  var converted = {};

  var mgf1 = options.mgf1;
  var mgfHash = (mgf1 || new SHA('1'))._getForgeMD();
  var mgf = forge.mgf.mgf1.create(mgfHash);

  var hash = options.hash;
  var md = (hash || new SHA('1'))._getForgeMD();

  converted.md = md;
  converted.mgf = mgf;

  toCopy.forEach(function(prop) {
    if (options[prop]) converted[prop] = options[prop];
  });

  return converted;
}
