var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

var Module = Module || require('../src/vendor/wasm/wrapper');

describe('Tools', function() {
  const {
    crc32,
    bytesToHex: hex,
    decode64,
    encode64,
    randomBytes,
    byteStringToArray,
    arrayToByteString,
    hashId,
    textToBytes,
    bytesToText,
    bytesToHex
  } = Universa;

  before((done) => {
    Universa.isReady.then(done);
  });

  const { randomByteString } = Universa.bytes;

  it('should convert text to bytes', () => {
    const msg = "life happens, дерьмо случается";
    expect(bytesToHex(textToBytes(msg))).to.equal("6c6966652068617070656e732c20d0b4d0b5d180d18cd0bcd0be20d181d0bbd183d187d0b0d0b5d182d181d18f");
  });

  it('should calc crc32 for bin', function() {
    const data = decode64('gvyrDZKjMVPIhManWZaKNMQIgSb6jpUles+5LvB8EVwRlqk5BACZN1J9L59ZOz1a+cEOt0vjOYoww7M5EjyurHgVc3ht7ras4Iocej2FnoSeGlx1sWe/NdpfXZtDSCKLRlRmIS2bjUbURDk=');
    const digest = crc32(data);

    expect(hex(digest)).to.equal("b5eaa121");
  });

  it.skip('should convert binaries by parts or not similar', function() {
    const sample = randomByteString(5000);

    const converted = arrayToByteString(byteStringToArray(sample), 13);
    const converted2 = arrayToByteString(byteStringToArray(sample));

    expect(sample).to.equal(converted);
    expect(sample).to.equal(converted2);
  });

  it('should calculate hashId', async () => {
    const data = decode64('gvyrDZKjMVPIhManWZaKNMQIgSb6jpUles+5LvB8EVwRlqk5BACZN1J9L59ZOz1a+cEOt0vjOYoww7M5EjyurHgVc3ht7ras4Iocej2FnoSeGlx1sWe/NdpfXZtDSCKLRlRmIS2bjUbURDk=');
    const result = decode64('DdNQDJ5NBT8JKi1TEm+ZxTgFmW8Yh1YD0sWxqCqOjAw4vAzDDImHMJcpOeqijjRPr72mdXugR55Fyl8TCIjI7+FP+wsbf/eewiTHPW6B/kUTJ8JwgrR/BGUlaUwiHv7n');

    expect(hex(await hashId(data))).eql(hex(result));
  });

  it('should calc b64 from array', function() {
    const b64 = encode64([169, 159, 176, 211, 190, 63, 226, 212, 158, 113, 84, 67, 47, 113, 181, 139, 123, 163, 20, 86, 14, 204, 132, 124, 93, 136, 147, 174, 229, 108, 79, 251, 111, 46, 248, 228, 253, 185, 105, 62, 108, 97, 33, 186, 46, 54, 85, 253, 209, 26, 82, 171, 91, 209, 193, 157, 194, 167, 81, 97, 46, 105, 173, 247, 90, 255, 109, 228, 73, 244, 192, 22, 222, 171, 165, 148, 165, 103, 51, 225, 228, 24, 4]);
    expect(b64).to.equal("qZ+w074/4tSecVRDL3G1i3ujFFYOzIR8XYiTruVsT/tvLvjk/blpPmxhIbouNlX90RpSq1vRwZ3Cp1FhLmmt91r/beRJ9MAW3qullKVnM+HkGAQ=");
  });

  it('should decode64', function() {
    expect(decode64("f7YrNmKlscCxpIwNw7jIIKrDtN1fkhsdsc7RDsZEb20").length).to.equal(32);
  });

  it('should convert bytes to Uint8Array', () => {
    const str = "ll3bklbj123klbj2b34ljk234=sd dfg*)&#$)*^!#%";
    const bytes = textToBytes(str);
    expect(bytesToText(bytes)).to.equal(str);
  });
});
