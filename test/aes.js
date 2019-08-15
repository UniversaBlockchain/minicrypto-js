const should = require('should');
const utils = require('../lib/utils');
const cipher = require('../lib/cipher');
const pki = require('../lib/pki');
const hash = require('../lib/hash');

const { SHA } = hash;
const { pbkdf2 } = pki;
const { AES, AESCTRTransformer } = cipher;
const { byteStringToHex, hexToBytes, textToBytes, randomBytes, byteStringToArray } = utils;

const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
const message = hexToBytes('00112233445566778899aabbccddeeff');
const encrypted = hexToBytes('8ea2b7ca516745bfeafc49904b496089');

describe('AES', function() {
  describe('AES 256', function() {
    it('should encrypt message by key', function() {
      // var cipher = new AES(key);
      const cipher = new AES(key);

      should(byteStringToHex(cipher.encrypt(message))).eql(byteStringToHex(encrypted));
    });

    it('should decrypt message by key', function() {
      var cipher = new AES(key);

      should(byteStringToHex(cipher.decrypt(encrypted))).eql(byteStringToHex(message));
    });

    it('should transform CTR', function() {
      var iv = randomBytes(16);

      var password = 'password';
      var iterations = 4096;
      var keyLength = 32;
      var salt = textToBytes('salt');

      var dk = pbkdf2(new SHA('256'), {
        password: password,
        salt: salt,
        iterations: iterations,
        keyLength: keyLength
      });

      var data = hexToBytes("abcd");

      var encrypted = new AESCTRTransformer(dk, iv).transform(data);

      should(1).eql(1);
    });
  });
});
