var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

var Module = Module || require('../src/vendor/wasm/wrapper');

describe('AES', function() {
  const {
    AES, AESCTRTransformer, pbkdf2, SHA,
    bytesToHex: hex,
    hexToBytes,
    textToBytes,
    randomBytes,
    byteStringToArray
  } = Universa;

  const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
  const message = hexToBytes('00112233445566778899aabbccddeeff');
  const encrypted = hexToBytes('8ea2b7ca516745bfeafc49904b496089');

  before((done) => {
    Universa.isReady.then(done);
  });

  describe('AES 256', function() {
    it('should encrypt data with key', function() {
      const cipher = new AES(key);

      expect(hex(cipher.encrypt(message))).to.equal(hex(encrypted));
    });

    it('should decrypt data with key', function() {
      const cipher = new AES(key);

      expect(hex(cipher.decrypt(encrypted))).to.equal(hex(message));
    });

    it.skip('should transform data in CTR mode', function() {
      const iv = randomBytes(16);
      const password = 'password';
      const iterations = 4096;
      const keyLength = 32;
      const salt = textToBytes('salt');

      const dk = pbkdf2('sha256', {
        password: password,
        salt: salt,
        iterations: iterations,
        keyLength: keyLength
      });

      const data = hexToBytes("abcd");
      const transformer = new AESCTRTransformer(dk, iv);
      const transformed = transformer.transform(data);

      const transformer2 = new AESCTRTransformer(dk, iv);
      const restored = transformer2.transform(transformed);

      expect(hex(data)).to.equal(hex(restored));
    });
  });
});
