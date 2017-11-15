const should = require('should');
const pki = require('../lib/pki');
const hash = require('../lib/hash');
const utils = require('../lib/utils');

const { bytesToHex, hexToBytes, arrayToBytes, arrayToBuffer, bytesToArray, randomBytes } = utils;

describe('Tools', function() {
  it('should convert large binaries', function() {
    const sample = randomBytes(1000000);
    var bigData = '';

    const converted = arrayToBytes(bytesToArray(sample));

    should(sample).eql(converted);
  });
});
