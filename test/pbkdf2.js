var should = require('should');
var pki = require('../lib/pki');
var hash = require('../lib/hash');
var utils = require('../lib/utils');

var bytesToHex = utils.bytesToHex;
var hexToBytes = utils.hexToBytes;
var textToHex = utils.textToHex;
var decode64 = utils.decode64;

var pbkdf2 = pki.pbkdf2;

var SHA = hash.SHA;

describe('PBKDF2', function() {
  it('should get derived key with SHA512', function() {
    var password = 'test';
    var iterations = 5000;
    var keyLength = 26;
    var salt = decode64('KFuMDXmo');
    var standard = decode64('yPsu5qmQto99vDqAMWnldNuagfVl5OhPr6g=');

    var dk = pbkdf2(new SHA('512'), {
      password: password,
      salt: salt,
      iterations: iterations,
      keyLength: keyLength
    });

    should(bytesToHex(dk)).eql(bytesToHex(standard));
  });

  it('should get derived key with SHA1', function() {
    var password = 'password';
    var iterations = 1;
    var keyLength = 20;
    var salt = textToHex('salt');

    var standard = '0c60c80f961f0e71f3a9b524af6012062fe037a6';

    var dk = pbkdf2(new SHA('1'), {
      password: password,
      salt: hexToBytes(salt),
      iterations: iterations,
      keyLength: keyLength
    });

    should(bytesToHex(dk)).eql(standard);
  });

  it('should get derived key with SHA256 and 1 iterations', function() {
    var password = 'password';
    var iterations = 1;
    var keyLength = 32;
    var salt = textToHex('salt');
    var standard = '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b';
    var dk = pbkdf2(new SHA('256'), {
      password: password,
      salt: hexToBytes(salt),
      iterations: iterations,
      keyLength: keyLength
    });

    should(bytesToHex(dk)).eql(standard);
  });

  it('should get derived key with SHA256 and 2 iterations', function() {
    var password = 'password';
    var iterations = 2;
    var keyLength = 32;
    var salt = textToHex('salt');
    var standard = 'ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43';

    var dk = pbkdf2(new SHA('256'), {
      password: password,
      salt: hexToBytes(salt),
      iterations: iterations,
      keyLength: keyLength
    });

    should(bytesToHex(dk)).eql(standard);
  });

  it('should get derived key with SHA256 and 4096 iterations', function() {
    var password = 'password';
    var iterations = 4096;
    var keyLength = 32;
    var salt = textToHex('salt');
    var standard = 'c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a';
    var dk = pbkdf2(new SHA('256'), {
      password: password,
      salt: hexToBytes(salt),
      iterations: iterations,
      keyLength: keyLength
    });

    should(bytesToHex(dk)).eql(standard);
  });

  it('should calculate key async, if callback provided', function(done) {
    var password = 'password';
    var iterations = 4096;
    var keyLength = 32;
    var salt = textToHex('salt');
    var standard = 'c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a';

    var options = {
      password: password,
      salt: hexToBytes(salt),
      iterations: iterations,
      keyLength: keyLength
    };

    pbkdf2(new SHA('256'), options, function(err, key) {
      should.not.exist(err);

      should(bytesToHex(key)).eql(standard);

      done();
    });
  });
});
