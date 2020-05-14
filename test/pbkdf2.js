var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

var Module = Module || require('../src/vendor/wasm/wrapper');

describe('PBKDF2', function() {
  before((done) => {
    Universa.isReady.then(done);
  });

  const { pbkdf2 } = Universa;
  const { SHA } = Universa;
  const { decode64, textToHex, hexToBytes, bytesToHex: hex } = Universa;

  it('should get derived key with SHA512', async () => {
    var password = 'test';
    var rounds = 5000;
    var keyLength = 26;
    var salt = decode64('KFuMDXmo');
    var standard = decode64('yPsu5qmQto99vDqAMWnldNuagfVl5OhPr6g=');

    var dk = await pbkdf2('sha512', {
      password,
      salt,
      rounds,
      keyLength
    });

    expect(hex(dk)).to.equal(hex(standard));
  });

  it('should get derived key with SHA1', async () => {
    var password = 'password';
    var rounds = 1;
    var keyLength = 20;
    var salt = textToHex('salt');

    var standard = '0c60c80f961f0e71f3a9b524af6012062fe037a6';

    var dk = await pbkdf2('sha1', {
      password,
      salt: hexToBytes(salt),
      rounds,
      keyLength
    });

    expect(hex(dk)).to.equal(standard);
  });

  it('should get derived key with SHA256 and 1 iterations', async () => {
    var password = 'password';
    var rounds = 1;
    var keyLength = 32;
    var salt = textToHex('salt');
    var standard = '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b';
    var dk = await pbkdf2('sha256', {
      password,
      salt: hexToBytes(salt),
      rounds,
      keyLength
    });

    expect(hex(dk)).to.equal(standard);
  });

  it('should get derived key with SHA256 and 2 iterations', async () => {
    var password = 'password';
    var rounds = 2;
    var keyLength = 32;
    var salt = textToHex('salt');
    var standard = 'ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43';

    var dk = await pbkdf2('sha256', {
      password,
      salt: hexToBytes(salt),
      rounds,
      keyLength
    });

    expect(hex(dk)).to.equal(standard);
  });

  it('should get derived key with SHA256 and 4096 iterations', async () => {
    var password = 'password';
    var rounds = 4096;
    var keyLength = 32;
    var salt = textToHex('salt');
    var standard = 'c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a';
    var dk = await pbkdf2('sha256', {
      password,
      salt: hexToBytes(salt),
      rounds,
      keyLength
    });

    expect(hex(dk)).to.equal(standard);
  });

  it.skip('should calculate key async, without salt', async () => {
    var password = 'password';
    var rounds = 4096;
    var keyLength = 32;

    const dk = await pbkdf2('sha256', {
      password,
      rounds,
      keyLength
    });

    expect(dk.length).to.equal(32);
  });
});
