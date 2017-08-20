var should = require('should');
var utils = require('../lib/utils');
var cipher = require('../lib/cipher');

var AES = cipher.AES;

var bytesToHex = utils.bytesToHex;
var hexToBytes = utils.hexToBytes;

var key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
var message = hexToBytes('00112233445566778899aabbccddeeff');
var encrypted = hexToBytes('8ea2b7ca516745bfeafc49904b4960899f3b7504926f8bd36e3118e903a4cd4a');

describe('AES', function() {
  describe('AES 256', function() {
    it('should encrypt message by key', function() {
      var cipher = new AES(key);

      should(bytesToHex(cipher.encrypt(message))).eql(bytesToHex(encrypted));
    });

    it('should decrypt message by key', function() {
      var cipher = new AES(key);

      should(bytesToHex(cipher.decrypt(encrypted))).eql(bytesToHex(message));
    });
  });
});
