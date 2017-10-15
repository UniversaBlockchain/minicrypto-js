const should = require('should');
const utils = require('../lib/utils');
const cipher = require('../lib/cipher');

const { AES } = cipher;
const { bytesToHex, hexToBytes } = utils;

const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
const message = hexToBytes('00112233445566778899aabbccddeeff');
const encrypted = hexToBytes('8ea2b7ca516745bfeafc49904b496089');

describe('AES', function() {
  describe('AES 256', function() {
    it('should encrypt message by key', function() {
      // var cipher = new AES(key);
      const cipher = new AES(key);

      should(bytesToHex(cipher.encrypt(message))).eql(bytesToHex(encrypted));
    });

    it('should decrypt message by key', function() {
      var cipher = new AES(key);

      should(bytesToHex(cipher.decrypt(encrypted))).eql(bytesToHex(message));
    });
  });
});
