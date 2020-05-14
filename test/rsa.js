var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

var Module = Module || require('../src/vendor/wasm/wrapper');

describe('RSA', function() {
  const {
    decode64,
    encode64,
    encode58,
    bytesToHex: hex,
    hexToBytes
  } = Universa;

  before((done) => {
    Universa.isReady.then(done);
  });

  const {
    rsa, PrivateKey, PublicKey,
    SymmetricKey, AbstractKey
  } = Universa;
  const { SHA } = Universa;

  Universa.seed = Universa.seed || {};
  const seedKeys = Universa.seed.keys || require('./seed/keys');
  const seedOAEP = Universa.seed.oaep || require('./seed/oaep');
  const seedPSS = Universa.seed.pss || require('./seed/pss');
  const seedCustomSalt = Universa.seed.customSalt || require('./seed/custom_salt');

  function fp(key) {
    return encode64(key.fingerprint);
  }

  describe('key creation', function() {
    it('should generate key pair', async () => {
      const options = { strength: 2048 };
      const priv = await PrivateKey.generate(options);

      expect(priv.publicKey.getBitStrength()).to.be.equal(2048);
    });

    it('should pack with password', async () => {
      this.timeout(8000);

      const base64Encoded = seedKeys[2];
      const key = await PrivateKey.unpack(decode64(base64Encoded));
      const keyPacked = await key.pack("qwerty");
      const key2 = await PrivateKey.unpack({ bin: keyPacked, password: "qwerty" });

      expect(fp(key2)).to.equal(fp(key));
    });

    it('should pack with password and iterations', async () => {
      this.timeout(8000);

      const base64Encoded = seedKeys[2];
      const key = await PrivateKey.unpack(decode64(base64Encoded));
      const keyPacked = await key.pack({ password: "qwerty", rounds: 1000 });

      const key2 = await PrivateKey.unpack({
        bin: keyPacked,
        password: "qwerty"
      });


      expect(fp(key2)).to.equal(fp(key));
    });

    it('should read v2 keys', async () => {
      const keyBin = decode64("HhisGAUQuCAAuPpkMr8wf6f/jCb2p1+5xDwCU25f/m3Q7dh3R31OUfD+WvAtDga1aifgufNudMwZREU6yiqADUIEBsELX6kFEHn0hd5zsniIoGchIhMWeaQ+F2EzB7wkK742QoY4mlbJpCsNzc8ehr/MsD19a8Im0YdJ4t1gudvQE7h+tRrImh+CLIN4FpHtvT0ZNroDKnNCnimOPbfe0jFip3cnC6bGdEvvpkLVJwWs1OQa6kkPBrdCMI3NrTlk21qxMu/ySukeRhCGsSp+KprNWinUWrVqfKmWkrKdLLePlyY+HB6sQkIBmZ7PbVd3nejRiTGeswOR+ZTHOvE4t5afVq+dfmWFsNlEGCQvKmwUqxPIw+kw5IcUdZrat0DvsJ2rDS6LwlnaNBLoEd7EgaPcI3lvjwuQ8XjCBQ05YrHwegTkLv6djqwfooS6ip4wCMmwPG1t294hP5BXcJ/i1uv2pkNdEQMacPbXjiPw0d5v0S02/VJv9oJ3NWLqtMhxgjFAhuKyzyz/0gqpQllW9zJrYQop3oNv1l6v0+FMo5ITfqB+NvuX5LjSYXimKLnj7BqwO4lVfOTaTehHaNGuBW4JqC5F3eRx1YWFmIM6VHlsXJ9KzmK9nSA1mDJe1v3GNq7bd8GDGsF89ROB2M44p8yN9tJnXIGn/pxB+7/2sB9suUcxgykkTePnnpIoo1AdoWppTG/qNtXDi0amhy3XwOg0kDQg60JNW4mo5did7Z6vkTPufi9yFcW+H3s9JB1IssbETopHDJ80Vl+xYAozLvEKxbectXw");
      const password = "81bf60af-703c-4c28-8fc7-878860089df5";

      const key2 = await PrivateKey.unpack({
        bin: keyBin,
        password: password
      });

      expect(fp(key2)).to.equal("B5l9sd9iOGaGVJk+3dTD//7a+heSx600CP04k8uSPTlk");
    });

    it('should read/write key from/to BOSS format', async () => {
      const base64Encoded = seedKeys[2];
      const key = await PrivateKey.unpack(decode64(base64Encoded));
      const fp = await key.fingerprint;

      expect(hex(fp)).to.equal('07b17c159a49e312880ce5bc9143c27655f72f62f9a07c52ffa5a506c438faacb1');
    });

    it('should check equality of keys', async () => {
      var key1 = await PrivateKey.unpack(decode64(seedKeys[2]));
      var key2 = await PrivateKey.unpack(decode64(seedKeys[3]));

      expect(rsa.keysEqual(key1, key2)).to.be.false;
      expect(rsa.keysEqual(key1, key1)).to.be.true;
    });
  });

  describe('Public key', function() {
    it('should return bit strength', async () => {
      const options = {
        strength: 2048
      };

      const priv = await PrivateKey.generate(options);
      expect(priv.publicKey.getBitStrength()).to.be.equal(2048);
    });

    it('should return encryption max length', async () => {
      var oaepOpts = {
        seed: seedOAEP.seed,
        pssHash: 'sha1',
        mgf1Hash: 'sha1'
      };

      const pub = await PublicKey.unpack(decode64("HggMEbyAu/gvCQaCzpwjOKwrnahx9zaNB+7UEEOkQNa28HRU9R+437qvA1wCq2HqSM7rb81Idu1SDWDh7EYZcZ2KW4uAf6+44KPfxzdyPua0t9k6JYTuamSdBglTdIg0skVFmDlO4KqxLXthpR9SeppB9sFof+JTcpjKKo9ZRvjl/Qkdvcs="));

      // console.log(pub.shortAddress58);

      expect(pub.encryptionMaxLength(oaepOpts)).to.equal(86);
    });

    it('should return encryption max length with string opts', async () => {
      var oaepOpts = {
        seed: seedOAEP.seed,
        pssHash: 'sha1',
        mgf1Hash: 'SHA1'
      };

      const pub = await PublicKey.unpack(decode64("HggMEbyAu/gvCQaCzpwjOKwrnahx9zaNB+7UEEOkQNa28HRU9R+437qvA1wCq2HqSM7rb81Idu1SDWDh7EYZcZ2KW4uAf6+44KPfxzdyPua0t9k6JYTuamSdBglTdIg0skVFmDlO4KqxLXthpR9SeppB9sFof+JTcpjKKo9ZRvjl/Qkdvcs="));

      expect(pub.encryptionMaxLength(oaepOpts)).to.equal(86);
    });

    // need new key
    it.skip('should verify address', async () => {
      const pub = await PublicKey.unpack(decode64("HggMEbyAu/gvCQaCzpwjOKwrnahx9zaNB+7UEEOkQNa28HRU9R+437qvA1wCq2HqSM7rb81Idu1SDWDh7EYZcZ2KW4uAf6+44KPfxzdyPua0t9k6JYTuamSdBglTdIg0skVFmDlO4KqxLXthpR9SeppB9sFof+JTcpjKKo9ZRvjl/Qkdvcs="));

      const addressString = pub.longAddress58;
      const addressShortString = pub.shortAddress58;

      expect(PublicKey.isValidAddress(addressString)).to.be.true;
      expect(PublicKey.isValidAddress(addressShortString)).to.be.true;
      expect(PublicKey.isValidAddress(addressShortString + "a")).to.be.false;
    });

    // it('should encrypt data with default parameters', async () => {

    // });

    it('should encrypt data with OAEP and MGF1 with string opts', async () => {
      // To make test repeatable
      var oaepOpts = {
        seed: seedOAEP.seed,
        pssHash: 'SHA1',
        mgf1Hash: 'sha1'
      };
      const publicKey = await PublicKey.unpack(decode64("HggMEbyAu/gvCQaCzpwjOKwrnahx9zaNB+7UEEOkQNa28HRU9R+437qvA1wCq2HqSM7rb81Idu1SDWDh7EYZcZ2KW4uAf6+44KPfxzdyPua0t9k6JYTuamSdBglTdIg0skVFmDlO4KqxLXthpR9SeppB9sFof+JTcpjKKo9ZRvjl/Qkdvcs="));
      var encrypted = await publicKey.encrypt(seedOAEP.originalMessage, oaepOpts);

      expect(hex(encrypted)).to.equal(hex(seedOAEP.encryptedMessage));
    });

    it('should calculate fingerprint', async () => {
      const base64Encoded = seedKeys[1];
      const key = await PrivateKey.unpack(decode64(base64Encoded));
      const fp_full = '074118648ED82A64B9A9FF6A9CB7BCD64CF5367E290E1C80C333A08107C1F82663'.toLowerCase();
      const fp = key.fingerprint;

      expect(hex(fp)).to.equal(fp_full);
    });

    // need new key
    it.skip('should verify message PSS signature', async () => {
      const publicKey = await PublicKey.unpack(decode64("HggMEbyAu/gvCQaCzpwjOKwrnahx9zaNB+7UEEOkQNa28HRU9R+437qvA1wCq2HqSM7rb81Idu1SDWDh7EYZcZ2KW4uAf6+44KPfxzdyPua0t9k6JYTuamSdBglTdIg0skVFmDlO4KqxLXthpR9SeppB9sFof+JTcpjKKo9ZRvjl/Qkdvcs="));
      var pssOpts = {
        salt: seedPSS.salt,
        pssHash: 'sha1',
        mgf1Hash: 'sha1'
      };

      var isCorrect = await publicKey.verify(seedPSS.message, seedPSS.signature, pssOpts);

      expect(isCorrect).to.be.true;
    });


    it('should verify real message', async () => {
      var publicKey = await PublicKey.unpack(hexToBytes('1E081C010001C40002CC713D89B5A59CAE11CE9805201E23220DD6717652297340A8E4D852D197634DF1252C29A84FB2FC76EAA84D16B26700B796B41791FB6F3F3B532F0C7B551D20370E2603FC1CC17633423F9244FA779F598581FF4E5A437292EF9C958495901F3B2B5A202134D5B90E91FE8CCF97A0A53A031043D91FF4578A08FDC24497924E375994B1558E5FDB36959A26D467D54BA099668CD4D9FAEB495198BAEA2BBD7B4497BA93ABFFE0492F51A6E7DE70DF615DD35E35901BC01D80C7CF62B7C789B5A0501C12527CDDA852975BBCE7F9DA21A7F6CAEC6240DCF7B853139F422950B08CBCB32F984F8BF62A3BF8A59795DDAEB2E8CC5C8D72703470F3987A20994F70A1D540A9C9FF8C0D054BDE0432C52E539C3290B35A53BF0FB33623235AF1712FC0F68526537550DFFD795A5A4540447C3ABACE2F910BC31A556CC56CD8BDD77B2E63443C17B7A3291E9A42F40FB8D37A6CAEA245865C8717BF1705885CEAF40B4C80DCD160C4A2E22998E4779789F3818BCBE883D344738E89BE186E050D02ABD87C58643743B8B1383C4A584B3101FFC2F222A78CEDD4B268715304823FB0BB85AEEE9F7E82B104D93F73000666A3B00F77E426336AD51DE1E90CA559723F7123BDC919D13263012706A531EC4E737FE43C411D7E31FF19C254D0CC3A0E0A18F1081F68DC177056C152F7F74F0679332B1FDB538B1C7D7783C8334449BE87C7'));
      var signature = hexToBytes('661B63FFB0A511E0F12522D5E1503B1FF914BF545FF4E7BC453072B748B8866CE7C0ECA27844F8BA7EC47CE6491B794E81FBC3523C696007813E8BA3725D4A9B95538C35621D4331E23B54091F3F8C68A55D965472DC7853CC9F6E94A94BADA3028E7E084513BD494D3ECC782F852B345C2FBBEF8C3CAA05C8C1FF34A6B390EBB76BD9CADEA5005CF2A0533AA37DC254D0FA0CD86A43D275BA23404396ECABA8C08B2CB3ED4FE12E2C056C6E5CEDF63EA82AB063902CAA9C4B00164C8F888870D6AFB0DEE44FD706FFA8DA03F374F36C9C3940F73ED36B6EF7B01022F4D11F358843627DA5F4C0EC353D9B561BAE9EE63E71044EA9D719E498EAEC43F0E340943F1DB0E3131B27DBD267501822E797D43E044D4DFC6865AAB80EEADF1310443F75D6A1404E1181E4CFF26A34CE2A8E962A33C5F06BA9EFC93CB600934ED65CA2E7B15F0C066FC39B118082EDD56B3D957DA9AD614A6025794998751344FC8C6B3F02E3942642F979915BC6F4914C665881F982B75CD0EE68B50F64EE28B3B91189932EC5E1076BE34A5152386DA126AC7CA235E34EDBF19C33903675E26005F26F147E0685CC5C89DE5C2FB3D2D7B5B27016DF11BE567D696B2046D1FF6060B361C5C28EB4897C04D357F4FECB193239F79AAA4CEDD747C4E42078BF7DD122AEE2B14F8AFADE9C09A5EC4D34DAECFD17FC4D6984B14351F62FEBEB4E7CC6B4A9');
      var data = hexToBytes('1F33736861353132BC40BFF822E7C37CF8D0465A02A169BCE1176BCCCDCBC3F64C31BE3EE46273E8747A8B83FED8AD338881F5FEC8DEE60E3F03DC09F79A4CE1C297EF316B2B0076847253637265617465645F6174796A1C704D851B6B6579BC21076E17915372DDF4895190732EC9C9A387FE66A1B06CDC47801AF5F7C1483E0CB2');

      var isCorrect = await publicKey.verify(data, signature, {
        pssHash: 'sha512',
        mgf1Hash: 'sha1'
      });

      expect(isCorrect).to.be.true;
    });

    // need new key
    it.skip('should calculate address', function() {
      const publicKey = new PublicKey('EXPONENTS', seedOAEP);
      const pubK = new PublicKey('BOSS', decode64("HggcAQABxAEBAKPW/V0ov09rGWAMoBSWuRHzf2yzA29WgLRzJvZutClo9xfo8KaOryl1NxtvOBJ9xsdH0fMXyV/1LBWa9U5v7vBO49m7oneIQt0GIJ35mWcZPp9WjZVzMogy9xvRoDSTMrfWuApJRWnD0Z5bYDxI9kObKA17Vrv8gr0YD7kK9r2J9tJDcV7pPthHWzLDgLVQHX/l86zK+MGDFypX8OWo5murr7ESTzqA42VHprwdwhJ2zrwqdFMbVozwC4OpWkCEEgQNZUDYYx1fAUR4RnoCB/51RkoRmKkLjjJpV+ZIXg+SqU9hUJPtJ08JnaHcz66lbA3utcolnck4NT1MtVeZKAs="));
      const addr = "ZFPU5QyNJPA3LsyLwJU4UiFMfxZ7BUoxbF5SMdRMdNGhXUWnar";

      expect(encode58(pubK.address())).to.equal(addr);
    });

    it('should calculate short address', async () => {
      const privateEncoded = hexToBytes("26001c010001c40001f05da97d084313655c43e7caf582fd2dcb76eff3309ec49cc70ef7a2c82547e01b3c5a6d51ca48ae44bc05d1a089c2019865a44c49bbcd48c54ae59f21dba28f65fee44d1aa1389cfa9eca8a2e218f94c735b5bb1e3313afafcfd62657fb86bdd7bf3cbda7943509a9ce2c92534584424b0f8fe5fbadd944c378aa967d206128a6a1e259b597c286d67778ee3c548df8ea39aff4ec993a1858e2fc51d12698b674280664ddc0714b81613b97f1da4b9be8a2617be4faa720a5a183f2910862040b26e0292cc3368442210f1b6171bb0ccdd1e042d253afd8eabb79f6edfcf27dce28a09b7d81ffc161a64dcf42190aedac1cf50ec86bb390fd15ab33b4d4f44fc40001d9bd6a350d985789f574ed8c410e7cf1d79db784a494b33d98c440794797fa8ba76d5feb7c32897a221f87dc26414076d279333eed9e0d7c6c8fea801ec07f3ad69921a3f2e1ec6a0910fea6af48703fd98b92e6b6eaba23b3a619ab071ba4f80a89790e50619a921bf5f93193f54b059c78af097209ce050bd0eada0c6775a003315d8d4d3cccd0ee2740ad1a404ccd37d92992a2a717bcdbd46785813ab0f701be34753af658565c8f10550e91f13c1e1a1e167dcd7d37cd87189beb8baee375366346553b7951b35e1e2c80446bbeb2398163932dd288bdd44ba7f15a9fb05372e0340162ce3fa6ef324fd06b677990c9faf1e8dd7342a73ab2640695bf09");
      const priv = await PrivateKey.unpack(privateEncoded);
      const pub = priv.publicKey;
      const shortAddress = pub.shortAddress;

      expect(encode58(shortAddress)).to.equal("26RzRJDLqze3P5Z1AzpnucF75RLi1oa6jqBaDh8MJ3XmTaUoF8R")
    });

    describe('signature with custom salt', function() {
      var privateKey, publicKey;

      beforeEach(async () => {
        // TODO: need to implement in wasm
        // privateKey = await PrivateKey.unpack({
        //   e: seedCustomSalt.e.toString(16),
        //   p: seedCustomSalt.p.toString(16),
        //   q: seedCustomSalt.q.toString(16)
        // });
        // publicKey = privateKey.publicKey;
      });

      it.skip('should restore keys by exponents with correct modulus', function() {
        var n = publicKey.getN();

        expect(n).to.equal(seedCustomSalt.n.toString(16));
      });

      it.skip('should use maximum salt length for signatures by default (490)', async () => {
        expect(await publicKey.verify(seedCustomSalt.message, seedCustomSalt.signature, { pssHash: 'sha1', mgf1Hash: 'sha1' })).to.equal(true);

        expect(await publicKey.verify(seedCustomSalt.message, seedCustomSalt.signature, {
          pssHash: 'sha1',
          mgf1Hash: 'sha1',
          saltLength: seedCustomSalt.saltLength
        })).to.equal(true);
      });

      it.skip('signature check with default params expect work for signature created with default params', async () => {
        var signature = await privateKey.sign(seedCustomSalt.message, { pssHash: 'sha1' });

        expect(await publicKey.verify(seedCustomSalt.message, signature, { pssHash: 'sha1' })).to.equal(true);
      });

      it.skip('should pss sign with sha3', async () => {
        var signature = await privateKey.sign(seedCustomSalt.message, { pssHash: "sha3_384" });

        expect(await publicKey.verify(seedCustomSalt.message, signature, { pssHash: "sha3_384" })).to.equal(true);
      });

      it('should pss 384', async () => {
        var keyB = decode64("JgAcAQABvIDoaVg0PVAe9jcbthAtqajcFUNDI+hi4YVJbOGPSCmXBPLGhAYjDNNVJ2mvSxSED7Aa3nVu/M0NqmRrzOQZuXk7EBAjkDeP5xKJKes5O2okwvjU1Tysg2/xe5vkSKpsLVBMaZ38W2Vgq5gvyfhl87T9fJCaNVUw4ZvhiDvPJoGO9byA2nbKMXmYM/qM/p5tLI91NX0TofBCXgCHrccDHnOwN0ftx2qR3tE/0U4AFY4FTig2BBm4Loq8r0TSuF79gjJHKcmY0fAKmE4VBCSBOXDqbClJ4ywOK7BbJ53xX/MfVEI26cFVZySPXWoYu05+fzEta9tcViOY7ouqgys9f8biTT8");
        var msg = hexToBytes("85e965a0");

        var priv = await PrivateKey.unpack(keyB);
        var signature;
        // signature = priv.sign(msg, {
        //   pssHash: new SHA("3_384"),
        //   mgf1Hash: new SHA("1")
        // });
        signature = decode64("N4F/jKomkjHJQJELFddbQaeqITmIQv6rrIdZojE5XVdLuz+batkPzhFIz4vS6KMjRpn7RkMSXzhnVWOqHntl3TjTkOzYNO8C4pYNB+gwWCC0VxGdF/orgwHMT9waOrobNolaOyJi50lRX0ubsrqhbZ5VWtaWuaG8IO/F7G99KvnVUctZcA9v1ZtHEbS4Gj7baXXi0zxennTz/UOA2WtO8HLNIpRCGE7Euw/PMFHcosslc5CAM8hfMenZ3P/DFSvNcEdkN6wMKKPavoKmt3ERWiYdpT4a0ounUf0xY26wgecJTsbzaieWtnhdP5RqVTYHIoP/fvTfoJz2b8pCHNnELg");

        expect(await priv.publicKey.verify(msg, signature, {
          pssHash: "sha3_384",
          mgf1Hash: "sha1"
        })).to.equal(true);
      });
    });
  });

  describe('Private key', function() {
    it.skip('should read from BOSS format', async () => {
      var privateKey = await PrivateKey.unpack({
        e: seedOAEP.e.toString(16),
        p: seedOAEP.p.toString(16),
        q: seedOAEP.q.toString(16)
      });

      const packed = await privateKey.pack();
      const unpacked = await PrivateKey.unpack(packed);

      const packed2 = await unpacked.pack('mypassword');
      const unpacked2 = await PrivateKey.unpack({ bin: packed2, password: 'mypassword' });

      expect(unpacked.getP()).to.equal(unpacked2.getP());
      expect(unpacked2.getQ()).to.equal(privateKey.getQ());
    });

    it.skip('should restore key from exponents (e, p, q)', async () => {
      var privateKey = await PrivateKey.unpack({
        e: seedOAEP.e.toString(16),
        p: seedOAEP.p.toString(16),
        q: seedOAEP.q.toString(16)
      });

      expect(privateKey.getN()).to.equal(seedOAEP.n.toString(16));
      expect(privateKey.getE()).to.equal(seedOAEP.e.toString(16));
      expect(privateKey.getP()).to.equal(seedOAEP.p.toString(16));
      expect(privateKey.getQ()).to.equal(seedOAEP.q.toString(16));
    });

    it.skip('should decrypt data with OAEP and MGF1', async () => {
      var oaepOpts = { seed: seedOAEP.seed, oaepHash: 'sha1' };
      var privateKey = await PrivateKey.unpack(seedOAEP);
      var decrypted = await privateKey.decrypt(seedOAEP.encryptedMessage, oaepOpts);

      expect(hex(decrypted)).to.equal(hex(seedOAEP.originalMessage));
    });

    it.skip('should encrypt with sha3 pss', function() {
      var privateKey = new PrivateKey('EXPONENTS', seedOAEP);
      var publicKey = privateKey.publicKey;

      var oaepOpts = {
        // seed: oaep.seed,
        pssHash: new SHA("3_384"),
        mgf1Hash: new SHA(1)
      };

      var encrypted = publicKey.encrypt(seedOAEP.originalMessage, oaepOpts);
      var decrypted = privateKey.decrypt(encrypted, oaepOpts);

      expect(encode64(seedOAEP.originalMessage)).to.equal(encode64(decrypted));
    });

    it.skip('should sign message with PSS', function() {
      var privateKey = new PrivateKey('EXPONENTS', seedPSS);
      var options = {
        salt: seedPSS.salt,
        pssHash: new SHA(1),
        mgf1Hash: new SHA(1)
      };

      var signature = privateKey.sign(seedPSS.message, options);

      expect(hex(signature)).to.equal(hex(seedPSS.signature));
    });

    it.skip('should sign message with PSS with 256 params', function() {
      var privateKey = new PrivateKey('EXPONENTS', seedPSS);

      var signature = privateKey.sign(seedPSS.message, { salt: seedPSS.salt, mgf1Hash: new SHA(256), pssHash: new SHA(256) });

      expect(hex(signature)).to.equal('39703c8bfbf6a54db3242769c03af7cedc4237e210aafd7802fcd34f68d9a7c57e766b59b8940196ca5ee6fbb549f5c8eb224a7e4280253b8f425c91014e05c08dacb830b4a753199b070caac0908368efa2134ec32670f48f8166e07564b5c3aa06a871772252b502f384ca96a4ae916805c255146b4b71ff7e74642f00b356');

      var isCorrect = privateKey.publicKey.verify(seedPSS.message, signature, { salt: seedPSS.salt, mgf1Hash: new SHA(256), pssHash: new SHA(256) });

      expect(isCorrect).to.equal(true);
    });
  });

  describe('Symmetric key', function() {
    it.skip('should create random symmetric key', function() {
      const symmetricKey = new SymmetricKey();

      const encrypted = symmetricKey.encrypt(seedPSS.message);
      const decrypted = symmetricKey.decrypt(encrypted);

      expect(hex(seedPSS.message)).to.equal(hex(decrypted));

      const encrypted2 = symmetricKey.etaEncrypt(seedPSS.message);
      const decrypted2 = symmetricKey.etaDecrypt(encrypted2);

      expect(hex(seedPSS.message)).to.equal(hex(decrypted2));
    });

    it.skip('should pack key as is', function() {
      const keyBytes = decode64("/bbMv7MMsbsWSi4Abujd/1nije6QADJeuqxAKyCg+gY=");
      const symmetricKey = new SymmetricKey({ keyBytes });

      const encrypted = symmetricKey.encrypt(seedPSS.message);
      const decrypted = symmetricKey.decrypt(encrypted);

      expect(hex(seedPSS.message)).to.equal(hex(decrypted));

      const encrypted2 = symmetricKey.etaEncrypt(seedPSS.message);
      const decrypted2 = symmetricKey.etaDecrypt(encrypted2);

      expect(hex(seedPSS.message)).to.equal(hex(decrypted2));
      expect(encode64(symmetricKey.pack())).to.equal(encode64(keyBytes));
    });
  });

  describe('Abstract key', function() {
    it('should verify address', async () => {
      const pub = decode64("HggcAQABxAEBAKPW/V0ov09rGWAMoBSWuRHzf2yzA29WgLRzJvZutClo9xfo8KaOryl1NxtvOBJ9xsdH0fMXyV/1LBWa9U5v7vBO49m7oneIQt0GIJ35mWcZPp9WjZVzMogy9xvRoDSTMrfWuApJRWnD0Z5bYDxI9kObKA17Vrv8gr0YD7kK9r2J9tJDcV7pPthHWzLDgLVQHX/l86zK+MGDFypX8OWo5murr7ESTzqA42VHprwdwhJ2zrwqdFMbVozwC4OpWkCEEgQNZUDYYx1fAUR4RnoCB/51RkoRmKkLjjJpV+ZIXg+SqU9hUJPtJ08JnaHcz66lbA3utcolnck4NT1MtVeZKAs=");

      expect(AbstractKey.TYPE_PRIVATE).to.equal(0);
      expect(AbstractKey.TYPE_PUBLIC).to.equal(1);

      expect(AbstractKey.typeOf(decode64(seedKeys[1]))).to.equal(AbstractKey.TYPE_PRIVATE);
      expect(AbstractKey.typeOf(pub)).to.equal(AbstractKey.TYPE_PUBLIC);

      const base64Encoded = seedKeys[2];
      const key = await PrivateKey.unpack(decode64(base64Encoded));
      const keyPacked = await key.pack("qwerty");

      expect(AbstractKey.typeOf(keyPacked)).to.equal(AbstractKey.TYPE_PRIVATE_PASSWORD_V2);
    });
  });
});
