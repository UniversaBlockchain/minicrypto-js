var should = require('should');
var utils = require('../utils');
var pki = require('../pki');

var bytesToHex = utils.bytesToHex;
var hexToBytes = utils.hexToBytes;
var randomBytes = utils.randomBytes;

var pbkdf2 = pki.pbkdf2;

var STANDARD = {
  pbkdf2: {
    'test password': 'd997a90cfc790eae7607fba38e245706'
  }
};

describe('PKI', function() {
  describe('PBKDF2', function() {
    var salt = 'd2f6cab92c5bd901824d7502196c86965b4ee01d799079bff9fe6d0f2e0b5c1c6ea100ad5077ae2ddf2acda2ee2c9a4b0f28a8b5d483dea0598c0693d2144118fbab9d0189b95cf1a99283d057337fb067631447fd6648e91c11735cd475b82e284ebb3490009197d6e03838ce1ac20c80d1a9d9386f4efd49aee7e0f50a644c';
    var password = 'test password';

    it('should generate derived key sync', function() {
      var key = pbkdf2.sync(password, hexToBytes(salt), 2, 16);

      bytesToHex(key).should.eql(STANDARD.pbkdf2[password]);
    });

    it('should generate derived key async', function(done) {
      pbkdf2.async(password, hexToBytes(salt), 2, 16, function(err, key) {
        should.not.exist(err);

        bytesToHex(key).should.eql(STANDARD.pbkdf2[password]);

        done();
      });
    });
  });
});
