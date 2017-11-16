const should = require('should');
const pki = require('../lib/pki');
const hash = require('../lib/hash');
const utils = require('../lib/utils');

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
});
