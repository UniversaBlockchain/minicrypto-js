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

const { bytesToHex, hexToBytes, raw, decode64, v2 } = utils;
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
      var oaepOpts = {
        seed: oaep.seed, 
        pssHash: new SHA(1),
        mgf1Hash: new SHA(1)
      };
      var publicKey = new PublicKey('EXPONENTS', oaep);

      var encrypted = publicKey.encrypt(oaep.originalMessage, oaepOpts);

      should(bytesToHex(encrypted)).eql(bytesToHex(oaep.encryptedMessage));
    });

    it('should calculate fingerprint', function() {
      const base64Encoded = vectors.keys[1];
      const key = new PrivateKey('BOSS', readKey64(base64Encoded));
      const fp_full = '074118648ED82A64B9A9FF6A9CB7BCD64CF5367E290E1C80C333A08107C1F82663'.toLowerCase();
      const fp = key.publicKey.fingerprint();

      should(bytesToHex(key.publicKey.fingerprint())).eql(fp_full);
    });

    it('should verify message PSS signature', function() {
      var publicKey = new PublicKey('EXPONENTS', pss);
      var pssOpts = { 
        salt: pss.salt, 
        pssHash: new SHA(1),
        mgf1Hash: new SHA(1)
      };

      var isCorrect = publicKey.verify(pss.message, pss.signature, pssOpts);

      should(isCorrect).eql(true);
    });

    it('should verify real message', function() {
      var publicKey = new PublicKey('BOSS', hexToBytes('1E081C010001C40002CC713D89B5A59CAE11CE9805201E23220DD6717652297340A8E4D852D197634DF1252C29A84FB2FC76EAA84D16B26700B796B41791FB6F3F3B532F0C7B551D20370E2603FC1CC17633423F9244FA779F598581FF4E5A437292EF9C958495901F3B2B5A202134D5B90E91FE8CCF97A0A53A031043D91FF4578A08FDC24497924E375994B1558E5FDB36959A26D467D54BA099668CD4D9FAEB495198BAEA2BBD7B4497BA93ABFFE0492F51A6E7DE70DF615DD35E35901BC01D80C7CF62B7C789B5A0501C12527CDDA852975BBCE7F9DA21A7F6CAEC6240DCF7B853139F422950B08CBCB32F984F8BF62A3BF8A59795DDAEB2E8CC5C8D72703470F3987A20994F70A1D540A9C9FF8C0D054BDE0432C52E539C3290B35A53BF0FB33623235AF1712FC0F68526537550DFFD795A5A4540447C3ABACE2F910BC31A556CC56CD8BDD77B2E63443C17B7A3291E9A42F40FB8D37A6CAEA245865C8717BF1705885CEAF40B4C80DCD160C4A2E22998E4779789F3818BCBE883D344738E89BE186E050D02ABD87C58643743B8B1383C4A584B3101FFC2F222A78CEDD4B268715304823FB0BB85AEEE9F7E82B104D93F73000666A3B00F77E426336AD51DE1E90CA559723F7123BDC919D13263012706A531EC4E737FE43C411D7E31FF19C254D0CC3A0E0A18F1081F68DC177056C152F7F74F0679332B1FDB538B1C7D7783C8334449BE87C7'));
      var signature = hexToBytes('661B63FFB0A511E0F12522D5E1503B1FF914BF545FF4E7BC453072B748B8866CE7C0ECA27844F8BA7EC47CE6491B794E81FBC3523C696007813E8BA3725D4A9B95538C35621D4331E23B54091F3F8C68A55D965472DC7853CC9F6E94A94BADA3028E7E084513BD494D3ECC782F852B345C2FBBEF8C3CAA05C8C1FF34A6B390EBB76BD9CADEA5005CF2A0533AA37DC254D0FA0CD86A43D275BA23404396ECABA8C08B2CB3ED4FE12E2C056C6E5CEDF63EA82AB063902CAA9C4B00164C8F888870D6AFB0DEE44FD706FFA8DA03F374F36C9C3940F73ED36B6EF7B01022F4D11F358843627DA5F4C0EC353D9B561BAE9EE63E71044EA9D719E498EAEC43F0E340943F1DB0E3131B27DBD267501822E797D43E044D4DFC6865AAB80EEADF1310443F75D6A1404E1181E4CFF26A34CE2A8E962A33C5F06BA9EFC93CB600934ED65CA2E7B15F0C066FC39B118082EDD56B3D957DA9AD614A6025794998751344FC8C6B3F02E3942642F979915BC6F4914C665881F982B75CD0EE68B50F64EE28B3B91189932EC5E1076BE34A5152386DA126AC7CA235E34EDBF19C33903675E26005F26F147E0685CC5C89DE5C2FB3D2D7B5B27016DF11BE567D696B2046D1FF6060B361C5C28EB4897C04D357F4FECB193239F79AAA4CEDD747C4E42078BF7DD122AEE2B14F8AFADE9C09A5EC4D34DAECFD17FC4D6984B14351F62FEBEB4E7CC6B4A9');
      var data = hexToBytes('1F33736861353132BC40BFF822E7C37CF8D0465A02A169BCE1176BCCCDCBC3F64C31BE3EE46273E8747A8B83FED8AD338881F5FEC8DEE60E3F03DC09F79A4CE1C297EF316B2B0076847253637265617465645F6174796A1C704D851B6B6579BC21076E17915372DDF4895190732EC9C9A387FE66A1B06CDC47801AF5F7C1483E0CB2');

      var isCorrect = publicKey.verify(data, signature, { 
        pssHash: new SHA(512),
        mgf1Hash: new SHA(1)
      });

      should(isCorrect).eql(true);
    });

    it('should calculate address', function() {
      var publicKey = new PublicKey('EXPONENTS', oaep);
      should(v2.encode58(publicKey.address())).eql("26Ah78vuENoN7gdWvRwZbq25tyX5YxNXSu8gyAEc33tGiBPUNsS");
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
        should(publicKey.verify(customSalt.message, customSalt.signature, { pssHash: new SHA(1), mgf1Hash: new SHA(1) })).eql(true);

        should(publicKey.verify(customSalt.message, customSalt.signature, {
          pssHash: new SHA(1),
          mgf1Hash: new SHA(1),
          saltLength: customSalt.saltLength
        })).eql(true);
      });

       it('signature check with default params should work for signature created with default params', function() {
        var signature = privateKey.sign(customSalt.message, { pssHash: new SHA(1) });

        should(publicKey.verify(customSalt.message, signature, { pssHash: new SHA(1) })).eql(true);
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
      var oaepOpts = { seed: oaep.seed, oaepHash: new SHA(1) };
      var privateKey = new PrivateKey('EXPONENTS', oaep);

      var decrypted = privateKey.decrypt(oaep.encryptedMessage, oaepOpts);

      should(bytesToHex(decrypted)).eql(bytesToHex(oaep.originalMessage));
    });

    // may be broken
    it.skip('should decrypt key data', function() {
      const text = utils.arrayToBytes(utils.decode64('aP2vtiA3oDNKFXRCsG6yV3e+S8rYyP3pV6Kfinl5dv/YNcEZx7FH8AHw5rOWdBWDSQGemp4A9OpasvFIkXJB/BTdVFlAabzIS2mpXsnx8y0hxK7V49+uGYL1SwtThK1ifenVzM7t6dBvQqhyqJ9OVhCXa4FPDvOd4DTn/+SSwyJZtDIex7c4nAV+7YXS1fhZVJ1pKOAh+qUPWhShFidOBaxckS2MeUUV+O3hidRPTtbY6kEG5i/0swLm04+Zu+rkOhgmZ71wGDXKMxdY+IlbQu6RLQvvVRwMWoivOli8UzKyzifJp9QlR6obHw63N2HdAhdjbPxVZuX2UKtDmFc2wLiAl83A6A4azjWlVXiHZjX1+FhZMd3Qn412cf4YtamUTzFLjJEtRihE0wZfG2sWCErNfWIYg8/a9EJHR6SiqP5Jz+sR+AE3VFqli9kG3nEZCJU+5eJTzRofGp7PvgN8vvO3owfVJk+dvdPXe4rrf97UCu+Fj81gnS29dsMZ53Y0yCWNKZ40tEXerbKMBEW/mO4nkloS5U47/xSy1FB5gTiM5crKIudQZLROu0yC1X0RfhQ/M4M7Ifz4GNs4RB2eLRCoX90wEOGE4BeJ4OJ9tcR37ofBd7jQiaYyedL20uFzQYQZ6cCYnZM19nBU9t9COGYDg1mhrhuWR9WMdLVvfQc='));
      const pk = utils.arrayToBytes(utils.decode64('JgAcAQABxAAB5eaGe+7EifujmPC+dEj5zqGbmuT5pUGMqnqV0WK8sf4I+6OILEVQgmISMeHbU2frotdX5SjJ2qtZnH27JLKFtzK9T0uMozGAPHyLqlJ0HX7UF3lJhSiCpSki1Uu4J43wdl/sw8DgdDW31fRSaLnNQ3d/aukALzG8puEXdlT9o++W64E5Pb1QhNsQwakgzW7cCDBEKfryAIf5obgOWaj8hPO4AifxUT2Eyy6qjA9UgQcDeqPDc9OrL2SFNe5qXFVmFslPTT9UTjdtJ8vJIE8zyytI4rt+Zk09JnOsMIw0ptJ2fYoqMcgvblcTTB1k4tVwKDmQC1VSOaLRk7KWdGSLB8QAAcTWK3O9pYC869epQFNDtTFug7QapIYKzDNcGFBc2clyMfLa9T/szBh+qui7+YWsyK5k3MsC5xxiz0C/oJ+u9Qk9bh8ATRDSM4M162V19xhb/3RkMj1G+VpVak0k2Pvlyt5CbSj/1JgD2z69zpXnW24zo+3A/E3AjPQHSI2NPHm8oP0daTQgAKvSVET5GEmcEcPGChUG4SRULIXS27RHSkrKSs40r8G7fLIx6hkZjhdr4a754nG746fAb6GJyWf6h6WzVjStwnazgQHtPXY82SKDiCxjy4eectnzaeAtto52xdaXTaN33MS1v/wPL99WwA48lv/K+wmYyVo56Ok8bGM='));
      const prk = new PrivateKey('BOSS', pk);
      // if oaep hash is sha1 - it's ok
      const decrypted = prk.decrypt(text, { oaepHash: new SHA(256), mgf1Hash: new SHA(1) });
      
      should(utils.encode64(utils.bytesToArray(decrypted))).eql('xQ05fry7sDV6qMgT6MM1i14AFcRFNeUmjuLu31w/rPE=');
    });

    it('should sign message with PSS', function() {
      var privateKey = new PrivateKey('EXPONENTS', pss);
      var options = { 
        salt: pss.salt,
        pssHash: new SHA(1),
        mgf1Hash: new SHA(1)
      };

      var signature = privateKey.sign(pss.message, options);

      should(bytesToHex(signature)).eql(bytesToHex(pss.signature));
    });

    it('should sign message with PSS without params', function() {
      var privateKey = new PrivateKey('EXPONENTS', pss);

      var signature = privateKey.sign(pss.message, { salt: pss.salt });

      should(bytesToHex(signature)).eql('39703c8bfbf6a54db3242769c03af7cedc4237e210aafd7802fcd34f68d9a7c57e766b59b8940196ca5ee6fbb549f5c8eb224a7e4280253b8f425c91014e05c08dacb830b4a753199b070caac0908368efa2134ec32670f48f8166e07564b5c3aa06a871772252b502f384ca96a4ae916805c255146b4b71ff7e74642f00b356');

      var isCorrect = privateKey.publicKey.verify(pss.message, signature, { salt: pss.salt });

      should(isCorrect).eql(true);
    });
  });
});
