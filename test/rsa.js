var should = require('should');
var utils = require('../utils');
var pki = require('../pki');

var bytesToHex = utils.bytesToHex;
var hexToBytes = utils.hexToBytes;
var randomBytes = utils.randomBytes;

var RSAProcessor = pki.RSAProcessor;

var STANDARD = {
  pbkdf2: {
    'test password': 'd997a90cfc790eae7607fba38e245706'
  }
};

describe('RSA', function() {
  describe('RSA key generation', function() {
    var rsa;

    beforeEach(function() {
      rsa = new RSAProcessor({ workerScript: '../vendor/worker.js' });
    });

    it('should generate keys', function(done) {
      // FIXME: why keys generation and convertation to pem takes so long time?
      this.timeout(4000);

      rsa.createKeys({ bits: 2048, e: 0x10001 }, function(err, pair) {
        should.not.exist(err);

        done();
      });
    });
  });
});
