exports.keysEqual = function keysEqual(key1, key2) {
  return key1.getN() === key2.getN() && key1.getE() === key2.getE();
};

exports.defaultPSSConfig = () => ({
  pssHash: "sha3_384",
  mgf1Hash: "sha1"
});
