var should = require('should');
var utils = require('../lib/utils');

var rsa = require('../lib/pki/rsa');
var hash = require('../lib/hash');
var Boss = require('../lib/boss/protocol');

var SHA = hash.SHA;

var bytesToHex = utils.bytesToHex;

var PrivateKey = require('../lib/pki/private_key');
var PublicKey = require('../lib/pki/public_key');

var vectors = require('./vectors');

var oaep = vectors.oaep;
var pss = vectors.pss;
var customSalt = vectors.customSalt;

describe('RSA', function() {
  describe('key creation', function() {
    it('should generate key pair', function(done) {
      // FIXME: why keys generation and convertation to pem takes so long time?
      this.timeout(8000);

      var options = {
        bits: 2048,
        e: 0x10001
      };

      rsa.createKeys(options, function(err, pair) {
        should.not.exist(err);

        should(pair.publicKey).be.instanceof(PublicKey);
        should(pair.privateKey).be.instanceof(PrivateKey);

        done();
      });
    });

    it.only('should read/write key from/to BOSS format', function() {
      var base64Encoded = vectors.keys[1];
      var key = new PrivateKey('BOSS', base64Encoded);
      var encoded = key.pack('BOSS');

      should(key.params.n.toString(16)).eql('cc518b92cef4a1baf1fe3fd3a4419bb5a0a5fe381c7d4b365dd672343a911236474a2fdff759dac21b40af42e83ec8ff30e403ed339faca0ab3a15f72a22dc822184a4949179590cbd53098d443fed61209a47223c4c6212e1b0085824d4ffd7f2d4927533f89a98132d070a61b062873c22b7ae65411a1ea6a9d33d30c5bbe63b19e05fe7589ac50ba5b704ee6fe9338d09dd7e9efd071534646101d058e676c9b650381ff5a0cdb2f11c3167378a25493957cb3ac71770a43cd77bc605b41f11c437560c0a0271154c4782f9c6a731477260e7334a380b81b197c1af53608d9ea451b136afdf7ada9ebba46db0a92464c7283b48a2eb332a89cc70ec02b8c66adc1e2344365db7f7bae30fe793e36eeacc93663969aca23a863556b2b9c4ff690f9f87994fa246c514bec71c91d0df26436934da51a6d484667d5e8f46f3599a8a5f52287dfd019e919ef4650406a44657f59342426ad61d33668b217ffe5f333c1858ce4cbbdcbbb71d486bca83f4eefed82088ea13e8b82288b639446831f61f298e96ebf5281056ed51d5f3e8e25c341386c699f4954a3f33a82efaf88e7d791e311bfbbcc947865349af32ddad1a5addafb10ff7401549a1c53bb7777533e269ec94e73d6f5927662c403a05b7b0541b3af816e91da94bbab8b095fedbb003253deffcbafb4190057f523564646d3f16d9e43a3b8be29a2694942bc047');
    });
  });

  describe('Public key', function() {
    it('should encrypt data with OAEP and MGF1', function() {
      // To make test repeatable
      var oaepOpts = { seed: oaep.seed };
      var publicKey = new PublicKey('EXPONENTS', oaep);

      var encrypted = publicKey.encrypt(oaep.originalMessage, oaepOpts);

      should(bytesToHex(encrypted)).eql(bytesToHex(oaep.encryptedMessage));
    });

    it('should verify message PSS signature', function() {
      var publicKey = new PublicKey('EXPONENTS', pss);
      var pssOpts = { salt: pss.salt };

      var hash = new SHA('1');
      var hashed = hash.get(pss.message, 'bytes');

      var isCorrect = publicKey.verify(hashed, pss.signature, pssOpts);

      should(isCorrect).eql(true);
    });

    describe('signature with custom salt', function() {
      var privateKey, publicKey;

      beforeEach(function() {
        privateKey = new PrivateKey('EXPONENTS', {
          e: customSalt.e,
          p: customSalt.p,
          q: customSalt.q
        });
        publicKey = privateKey.publicKey;
      });

      it('should restore keys by exponents with correct modulus', function() {
        var params = publicKey.params;

        should(params.n.toString(16)).eql(customSalt.n.toString(16));
      });

      it('should use maximum salt length for signatures by default (490)', function() {
        var hash = new SHA('1');
        hash.put(customSalt.message);
        var hashed = hash.get('bytes');

        should(publicKey.verify(hashed, customSalt.signature)).eql(true);

        should(publicKey.verify(hashed, customSalt.signature, {
          saltLength: customSalt.saltLength
        })).eql(true);
      });

       it('signature check with default params should work for signature created with default params', function() {
        var hash = new SHA('1');
        hash.put(customSalt.message);
        var hashed = hash.get('bytes');

        var signature = privateKey.sign(hash);

        should(publicKey.verify(hashed, signature)).eql(true);
      });
    });
  });

  describe('Private key', function() {
    it('should read from BOSS format', function() {
      var privateKey = new PrivateKey('EXPONENTS', {
        e: oaep.e,
        p: oaep.p,
        q: oaep.q
      });

      const packed = privateKey.pack('BOSS');

      const unpacked = new PrivateKey('BOSS', packed);

      should(unpacked.params.qInv).eql(privateKey.params.qInv);
    });

    it('should restore key from exponents (e, p, q)', function() {
      var privateKey = new PrivateKey('EXPONENTS', {
        e: oaep.e,
        p: oaep.p,
        q: oaep.q
      });

      var params = privateKey.params;

      should(params.n.toString(16)).eql(oaep.n.toString(16));
      should(params.e.toString(16)).eql(oaep.e.toString(16));
      should(params.d.toString(16)).eql(oaep.d.toString(16));
      should(params.p.toString(16)).eql(oaep.p.toString(16));
      should(params.q.toString(16)).eql(oaep.q.toString(16));
      should(params.dP.toString(16)).eql(oaep.dP.toString(16));
      should(params.dQ.toString(16)).eql(oaep.dQ.toString(16));
      should(params.qInv.toString(16)).eql(oaep.qInv.toString(16));
    });

    it('should decrypt data with OAEP and MGF1', function() {
      // To make test repeatable
      var oaepOpts = { seed: oaep.seed };
      var privateKey = new PrivateKey('EXPONENTS', oaep);

      var decrypted = privateKey.decrypt(oaep.encryptedMessage, oaepOpts);

      should(bytesToHex(decrypted)).eql(bytesToHex(oaep.originalMessage));
    });

    it('should sign message with PSS', function() {
      var privateKey = new PrivateKey('EXPONENTS', pss);
      var pssOpts = { salt: pss.salt };

      var hash = new SHA('1');
      hash.put(pss.message);

      var signature = privateKey.sign(hash, pssOpts);

      should(bytesToHex(signature)).eql(bytesToHex(pss.signature));
    });
  });
});
