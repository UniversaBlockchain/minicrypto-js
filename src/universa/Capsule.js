const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const PrivateKey = require('../pki/private_key');
const ExtendedSignature = require('../pki/extended_signature');

function getSignatures(capsulePacked) {
  const boss = new Boss();
  const capsule = boss.load(capsulePacked);

  return capsule.signatures;
}

exports.sign = (capsulePacked, privateKey) => {
  const boss = new Boss();
  const capsule = boss.load(capsulePacked);

  capsule.signatures.push(privateKey.signExtended(capsule.data));

  return boss.dump(capsule);
}

exports.getSignatures = getSignatures;

exports.getSignatureKeys = (capsulePacked) => {
  const signatures = getSignatures(capsulePacked);

  return signatures.map((signature) =>
    ExtendedSignature.extractPublicKey(signature)
  );
};
