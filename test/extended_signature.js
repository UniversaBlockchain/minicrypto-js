var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

var Module = Module || require('../src/vendor/wasm/wrapper');

describe('Extended signature', function() {
  Universa.seed = Universa.seed || {};
  var seedKeys = Universa.seed.keys || require('./seed/keys');

  const { PrivateKey, ExtendedSignature } = Universa;
  const { bytesToHex: hex, decode64, hexToBytes, textToHex } = Universa;
  const { keyId, extractKeyId, extractPublicKey } = ExtendedSignature;

  before((done) => {
    Universa.isReady.then(done);
  });

  it('should get key id', async () => {
    const key = await PrivateKey.unpack(decode64(seedKeys[1]));
    const id = await keyId(key);

    expect(hex(id)).to.equal('074118648ed82a64b9a9ff6a9cb7bcd64cf5367e290e1c80c333a08107c1f82663');
  });

  it('should sign and verify data', async () => {
    const data = hexToBytes(textToHex('Hello world'));
    const key = await PrivateKey.unpack(decode64(seedKeys[3]));
    const id = keyId(key);
    const pubKey = key.publicKey;
    const fp = pubKey.fingerprint;
    const sign = await key.sign(data);
    const signature = await key.signExtended(data);
    const es = await pubKey.verifyExtended(signature, data);

    expect(es).to.be.ok;
    expect(hex(es.key)).to.equal(hex(id));
    expect(hex(extractKeyId(signature))).to.equal(hex(pubKey.fingerprint));
  });

  it('should extract key from signature', async () => {
    const data = hexToBytes(textToHex('Hello world'));
    const key = await PrivateKey.unpack(decode64(seedKeys[3]));
    const id = keyId(key);
    const pubKey = key.publicKey;
    const signature = await key.signExtended(data);
    const extractedKey = await extractPublicKey(signature);

    expect(hex(pubKey.fingerprint)).to.equal(hex(extractedKey.fingerprint));
  });
});
