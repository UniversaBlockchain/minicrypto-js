const should = require('should');
const pki = require('../lib/pki');
const hash = require('../lib/hash');
const utils = require('../lib/utils');
const { Buffer } = require('buffer');
const SHA = hash.SHA;

const { bytesToHex, hexToBytes, arrayToBytes, arrayToBuffer, bytesToArray, randomBytes, raw, hashId } = utils;

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
    const data = utils.decode64('gvyrDZKjMVPIhManWZaKNMQIgSb6jpUles+5LvB8EVwRlqk5BACZN1J9L59ZOz1a+cEOt0vjOYoww7M5EjyurHgVc3ht7ras4Iocej2FnoSeGlx1sWe/NdpfXZtDSCKLRlRmIS2bjUbURDk=');
    const result = utils.decode64('DdNQDJ5NBT8JKi1TEm+ZxTgFmW8Yh1YD0sWxqCqOjAw4vAzDDImHMJcpOeqijjRPr72mdXugR55Fyl8TCIjI7+FP+wsbf/eewiTHPW6B/kUTJ8JwgrR/BGUlaUwiHv7n');

    should(utils.arrayToBytes(hashId(data))).eql(utils.arrayToBytes(result));
  });
});
