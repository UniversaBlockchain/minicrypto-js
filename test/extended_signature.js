var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

describe('Extended signature', function() {
  Universa.seed = Universa.seed || {};
  var seedKeys = Universa.seed.keys || require('./seed/keys');

  const { PrivateKey, ExtendedSignature } = Universa.pki;
  const { bytesToHex: hex, decode64, hexToBytes, textToHex } = Universa.utils;
  const { keyId, extractKeyId, extractPublicKey } = ExtendedSignature;

  it('should get key id', function() {
    const key = new PrivateKey('BOSS', decode64(seedKeys[1]));
    const id = keyId(key);

    expect(hex(id)).to.equal('074118648ed82a64b9a9ff6a9cb7bcd64cf5367e290e1c80c333a08107c1f82663');
  });

  it('should sign and verify data', function() {
    const data = hexToBytes(textToHex('Hello world'));
    const key = new PrivateKey('BOSS', decode64(seedKeys[3]));
    const id = keyId(key);
    const pubKey = key.publicKey;
    const signature = key.signExtended(data);

    const es = pubKey.verifyExtended(signature, data);

    expect(es).to.be.ok;
    expect(hex(es.key)).to.equal(hex(id));
    expect(hex(extractKeyId(signature))).to.equal(hex(keyId(pubKey)));
    expect(hex(keyId(key))).to.equal(hex(keyId(pubKey)));
  });

  it('should extract key from signature', function () {
    const data = hexToBytes(textToHex('Hello world'));
    const key = new PrivateKey('BOSS', decode64(seedKeys[3]));
    const id = keyId(key);
    const pubKey = key.publicKey;
    const signature = key.signExtended(data);

    const extractedKey = extractPublicKey(signature);

    expect(hex(pubKey.fingerprint())).to.equal(hex(extractedKey.fingerprint()));
  });
});
