var Universa = Universa || require('../index');
var chai = chai || require('chai');
var expect = chai.expect;

var Module = Module || require('../src/vendor/wasm/wrapper');


describe('Signed record', function() {
  const { PrivateKey, SignedRecord, Boss, decode64, encode64 } = Universa;
  const privateKeyPacked = decode64("JgAcAQABvIDcbubUZ1YvxjDCT33chA1BFY1iQvHJkB01xVeFJMmMR1h5wRFFlcTPyLRRxgtkxfX55PHHvNSaHoKRElRqIt/dmEW7p/Cwl1tTpQpOl1KU1eFYPY8MEMteGs4n6iKRqyRArk3N3X3Z/TzOb7Dcfhcy6MU+AtwNWFRHoJQShAAQTbyAzHz7GFoI3w4S1WvLbAkky+dkVSvER/rXL4aMUshiWixGCgOI+qucWkkse2Y3rdqaf23QKbh6XioYmviFlRsxNi7cQtSV4L0TlliXG03QCWZCOC4Jei2pqFiqCA3bEucajhrwZRFJO/DqNOjxT1i/T6hOzsIAnu2q8lk/HEfVDEE=");
  const boss = new Boss();

  before((done) => {
    Universa.isReady.then(done);
  });

  it('should sign with key without nonce', async () => {
    const key = await PrivateKey.unpack(privateKeyPacked);
    const record = await SignedRecord.packWithKey(key, { ab: "cd" });

    const recordObj = boss.load(record);
    expect(recordObj[0]).to.equal(0);

    const data = boss.load(recordObj[3]);
    expect(data[0]).to.equal(null);
    expect(data[1].ab).to.equal("cd");
  });

  it('should sign with key with nonce', async () => {
    const key = await PrivateKey.unpack(privateKeyPacked);
    const nonce = decode64("abcd");
    const record = await SignedRecord.packWithKey(key, { ab: "cd" }, nonce);
    const recordObj = boss.load(record);
    expect(recordObj[0]).to.equal(0);

    const data = boss.load(recordObj[3]);
    expect(encode64(data[0])).to.equal(encode64(nonce));
    expect(data[1].ab).to.equal("cd");
  });

  it('should unpack', async () => {
    const key = await PrivateKey.unpack(privateKeyPacked);
    const nonce = decode64("abcd");
    const recordPacked = await SignedRecord.packWithKey(key, { ab: "cd" }, nonce);

    const record = await SignedRecord.unpack(recordPacked);
    expect(record.recordType).to.equal(SignedRecord.RECORD_WITH_KEY);
    expect(encode64(record.nonce)).to.equal("abcd");
    expect(record.payload.ab).to.equal("cd");
  });
});
