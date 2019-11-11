const should = require('should');

const rsa = require('../lib/pki/rsa');
const hash = require('../lib/hash');
const utils = require('../lib/utils');
const Boss = require('../lib/boss/protocol');

const PrivateKey = require('../lib/pki/private_key');
const PublicKey = require('../lib/pki/public_key');
const extended = require('../lib/pki/extended_signature');
const vectors = require('./vectors');
const { readKey64 } = require('./helpers');

const { SHA } = hash;

const { bytesToHex, hexToBytes, raw, decode64, bytesToArray, arrayToByteString, bytes } = utils;
const { keyId, sign, verify, extractKeyId } = extended;
const { customSalt, pss, oaep } = vectors;

describe('Extended signature', function() {
  it('should get key id', function() {
    const key = new PrivateKey('BOSS', decode64(vectors.keys[1]));
    const id = keyId(key);

    should(bytesToHex(arrayToByteString(id))).eql('074118648ed82a64b9a9ff6a9cb7bcd64cf5367e290e1c80c333a08107c1f82663');
  });

  it('should sign and verify data', function() {
    const data = hexToBytes(bytes.textToHex('Hello world'));
    const key = new PrivateKey('BOSS', decode64(vectors.keys[3]));
    const id = keyId(key);
    const pubKey = key.publicKey;
    const signature = key.signExtended(data);

    const es = pubKey.verifyExtended(signature, data);

    should(es).be.ok();
    should(es.key).eql(id);
    should(extractKeyId(signature)).eql(keyId(pubKey));
    should(keyId(key)).eql(keyId(pubKey));
  });
});
