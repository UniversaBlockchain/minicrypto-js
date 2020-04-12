const Boss = require('../boss/protocol');
const { encode64Short, decode64 } = require('../utils');
const { PublicKey, defaultPSSConfig } = require('../pki');

class BadSignatureException extends Error {
  constructor(message = 'signature failed') { super(message); }
}

class SignedRecordFormatException extends Error {
  constructor(message = 'signature failed') { super(message); }
}

/**
 * Unpacked signed record, created by [[SignedRecord.unpack()]]
 *
 * Note that all the data in the record were checked agains key signature and are therefore not tampered and
 * _secure as much as the private key that was used to signe the data is_.
 *
 * @param recordType see [[SignedRecord.RECORD_WITH_KEY]] and other constants
 * @param key        public key that already vierified the record
 * @param nonce      any nonce that optionally was passed
 * @param payload    any data transfeerred with the signed record
 */
class SignedRecord {
  constructor(recordType, key, payload, nonce = null) {
    this.recordType = recordType;
    this.key = key;
    this.payload = payload;
    this.nonce = nonce;
  }

  // FIXME: webpack failes without error
  // static RECORD_WITH_KEY = 0;
  // static RECORD_WITH_ADDRESS = 1;
  static get RECORD_WITH_KEY() { return 0; }
  static get RECORD_WITH_ADDRESS() { return 1; }

  /**
   * Simple signed array pack woth the following structure:
   *
   * {{{
   *     signed_record = Array(type, keyOrAdddress, signature, signedData)
   *     signedData = array(nonce,payload)
   * }}}
   *
   * @param key     private key to sign with
   * @param payload any data [[Boss]] can process
   * @param nonce   optional nonce, usually sent by remote party to avoid repeat ciphertext attack
   * @return
   */
  static async packWithKey(key, payload, nonce = null) {
    const boss = new Boss();
    const pub = await key.publicKey.packed();
    const data = boss.dump([nonce, payload]);
    const signature = await key.sign(data, defaultPSSConfig());

    return boss.dump([
      SignedRecord.RECORD_WITH_KEY,
      pub,
      signature,
      data
    ]);
  }

  static async unpack(packed) {
    const boss = new Boss();
    const outer = boss.load(packed);
    const recordType = outer[0];
    if (recordType !== SignedRecord.RECORD_WITH_KEY)
      throw new SignedRecordFormatException(`not supported type ${recordType}`);

    const key = await PublicKey.unpack(outer[1]);
    const signature = outer[2];
    const innerPacked = outer[3];
    const inner = boss.load(innerPacked);
    if (!key.verify(innerPacked, signature, defaultPSSConfig()))
      throw new BadSignatureException();

    return new SignedRecord(SignedRecord.RECORD_WITH_KEY, key, inner[1], inner[0]);
  }
};

module.exports = SignedRecord;
