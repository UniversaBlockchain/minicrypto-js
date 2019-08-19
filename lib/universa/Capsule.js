const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const PrivateKey = require('../pki/private_key');
const ExtendedSignature = require('../pki/extended_signature');

exports.sign = (capsulePacked, privateKey) => {
  const boss = new Boss();
  const capsule = boss.load(capsulePacked);
  const opts = {
    pssHash: new SHA(512),
    mgf1Hash: new SHA(1)
  };

  capsule.signatures.push(privateKey.sign(capsule.contract, opts));

  return boss.dump(capsule);
}

exports.getSignatures = (capsulePacked) => {
  const boss = new Boss();
  const capsule = boss.load(capsulePacked);

  return capsule.signatures;
}

exports.getSignatureKeys = (capsulePacked) => {
  getSignatures(capsulePacked).map((signature) =>
    ExtendedSignature.extractPublicKey(signature)
  );
}
