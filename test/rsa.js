const rsa = require('../lib/pki/rsa');
const hash = require('../lib/hash');
const Boss = require('../lib/boss/protocol');
const utils = require('../lib/utils');
const should = require('should');
const vectors = require('./vectors');
const PublicKey = require('../lib/pki/public_key');
const PrivateKey = require('../lib/pki/private_key');

const { SHA } = hash;

const { readKey64 } = require('./helpers');

const { bytesToHex, hexToBytes, raw, decode64 } = utils;
const { oaep, pss, customSalt } = vectors;

describe('RSA', function() {
  describe('key creation', function() {
    it.skip('should generate key pair', function(done) {
      // FIXME: why keys generation and convertation to pem takes so long time?
      this.timeout(8000);

      const options = {
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

    it('should read/write key from/to BOSS format', function() {
      const base64Encoded = vectors.keys[2];
      const key = new PrivateKey('BOSS', readKey64(base64Encoded));

      should(key.params.p.toString(16)).eql('c0e7ac8d230f90888a59f72670a5d5b414a30f5669056a5f9e2637a096f13bc6aa1e6a6b1e0809f8d3cc04b986cd8ea3132603a73bf78ea4baf57493266112f821b04daca3ca594fa74c89bc8cac12ca18070ad75851e88e749ea7c414a03afa77559f27a9e7b0ef80619df60156729540461db4fb8860f3274ce9b8139efd996618e155bae573a6f4db6c9ff48979bfb94d103c5fdbcfdae5ea6f3aa89e28ed1f6a6466f6b35c29e85b760c68e1703ea27b8761c4ea55aceeb8ce7edab0c142c2ddb9d4245e2bd6044d63be14c5a0ada04ff139c40925fad7c37a6cffdd21244855f1277e5c4526078e15fd29853709a91d65ffba4062c72e857707a106cbb7');
    });

    it('should check equality of keys', function() {
      var key1 = new PrivateKey('BOSS', readKey64(vectors.keys[2]));
      var key2 = new PrivateKey('BOSS', readKey64(vectors.keys[3]));

      should(rsa.keysEqual(key1, key2)).eql(false);
      should(rsa.keysEqual(key1, key1)).eql(true);
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

    it('should calculate fingerprint', function() {
      const base64Encoded = vectors.keys[1];
      const key = new PrivateKey('BOSS', readKey64(base64Encoded));
      const fp_full = '00BC204118648ED82A64B9A9FF6A9CB7BCD64CF5367E290E1C80C333A08107C1F82663'.toLowerCase();
      const fp = key.publicKey.fingerprint();

      should(bytesToHex(key.publicKey.fingerprint())).eql(fp_full);
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
      const packed2 = unpacked.pack('BOSS');
      const unpacked2 = new PrivateKey('BOSS', packed2);

      should(unpacked.params.qInv.toString(16)).eql(unpacked2.params.qInv.toString(16));
      should(unpacked2.params.qInv.toString(16)).eql(privateKey.params.qInv.toString(16));
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
