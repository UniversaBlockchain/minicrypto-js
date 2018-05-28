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

  it('should calculate hashId', function() {
    const data = utils.decode64('gvyrDZKjMVPIhManWZaKNMQIgSb6jpUles+5LvB8EVwRlqk5BACZN1J9L59ZOz1a+cEOt0vjOYoww7M5EjyurHgVc3ht7ras4Iocej2FnoSeGlx1sWe/NdpfXZtDSCKLRlRmIS2bjUbURDk=');
    const result = utils.decode64('DdNQDJ5NBT8JKi1TEm+ZxTgFmW8Yh1YD0sWxqCqOjAw4vAzDDImHMJcpOeqijjRPr72mdXugR55Fyl8TCIjI7+FP+wsbf/eewiTHPW6B/kUTJ8JwgrR/BGUlaUwiHv7n');

    should(utils.arrayToBytes(hashId(data))).eql(utils.arrayToBytes(result));
  });

  it('should calc b64 from array', function() {
    should(utils.v2.encode64([169, 159, 176, 211, 190, 63, 226, 212, 158, 113, 84, 67, 47, 113, 181, 139, 123, 163, 20, 86, 14, 204, 132, 124, 93, 136, 147, 174, 229, 108, 79, 251, 111, 46, 248, 228, 253, 185, 105, 62, 108, 97, 33, 186, 46, 54, 85, 253, 209, 26, 82, 171, 91, 209, 193, 157, 194, 167, 81, 97, 46, 105, 173, 247, 90, 255, 109, 228, 73, 244, 192, 22, 222, 171, 165, 148, 165, 103, 51, 225, 228, 24, 4])).eql("qZ+w074/4tSecVRDL3G1i3ujFFYOzIR8XYiTruVsT/tvLvjk/blpPmxhIbouNlX90RpSq1vRwZ3Cp1FhLmmt91r/beRJ9MAW3qullKVnM+HkGAQ=");
  });

  it('should decode64', function() {
    should(utils.v2.decode64("f7YrNmKlscCxpIwNw7jIIKrDtN1fkhsdsc7RDsZEb20").length).eql(32);
  });
});
