var formatMap = {
  'hex': 'toHex',
  'bytes': 'bytes'
};

exports.getValue = getValue;

function getValue(format) {
  return formatDigest(this.forgeMD.digest(), format);
}

function formatDigest(digest, format) {
  var method = formatMap[format];

  return digest[method]();
}
