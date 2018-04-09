const should = require('should');
const pki = require('../lib/pki');
const hash = require('../lib/hash');
const utils = require('../lib/utils');
const GOST = require('../lib/hash/gost');

const { bytesToHex, hexToBytes, arrayToBytes, arrayToBuffer, bytesToArray, randomBytes, raw } = utils;

describe('Tools', function() {
  it('should convert large binaries', function() {
    const sample = randomBytes(1000000);
    var bigData = '';

    const converted = arrayToBytes(bytesToArray(sample));

    should(sample).eql(converted);
  });

  it('should convert binaries by parts or not similar', function() {
    const sample = randomBytes(5000);

    const converted = arrayToBytes(bytesToArray(sample), 13);
    const converted2 = raw.encode(bytesToArray(sample));

    should(sample).eql(converted);
    should(sample).eql(converted2);
  });  

  it.only('should calculate hashId', function() {
    const gost = new GOST({ name: 'GOST R 34.11', version: 2012 });
    console.log(gost.digest("abc"));
    should(1).eql(0);
  });
});
