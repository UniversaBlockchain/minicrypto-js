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

    it.skip('should read key from BOSS format', function() {
      var base64Encoded = vectors.keys[0];
      var bossEncoded = utils.decode64(base64Encoded);
      var boss = new Boss();

      console.log(typeof bossEncoded);

      console.log(boss.unpack(bossEncoded.split('')));
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
