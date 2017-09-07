var should = require('should');
var utils = require('../lib/utils');

var rsa = require('../lib/pki/rsa');
var hash = require('../lib/hash');
var Boss = require('../lib/boss/protocol');

var SHA = hash.SHA;

const { bytesToHex, hexToBytes, textToHex, raw } = utils;

const PrivateKey = require('../lib/pki/private_key');
const PublicKey = require('../lib/pki/public_key');
const extended = require('../lib/pki/extended_signature');

const { keyId, sign, verify } = extended;

var vectors = require('./vectors');

var oaep = vectors.oaep;
var pss = vectors.pss;
var customSalt = vectors.customSalt;

describe('Extended signature', function() {
  it('should get key id', function() {
    const key = new PrivateKey('BOSS', vectors.keys[1]);
    const id = keyId(key);

    should(bytesToHex(id)).eql('00bc204118648ed82a64b9a9ff6a9cb7bcd64cf5367e290e1c80c333a08107c1f82663');
  });

  it('should sign and verify data', function() {
    const data = hexToBytes(textToHex('Hello world'));
    const key = new PrivateKey('BOSS', vectors.keys[3]);
    const id = keyId(key);
    const pubKey = key.publicKey;
    const signature = sign(key, data);

    const es = verify(pubKey, signature, data);

    should(es).be.ok();
    should(es.keyId).eql(id);
    should(keyId(key)).eql(keyId(pubKey));
  });
});
