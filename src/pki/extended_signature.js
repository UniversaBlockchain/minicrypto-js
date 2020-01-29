const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const utils = require('../utils');
const PublicKey = require('./public_key');

const { byteStringToArray, arrayToByteString } = utils;

exports.keyId = keyId;
exports.extractKeyId = extractKeyId;
exports.extractPublicKey = extractPublicKey;

exports.sign = (key, data) => key.signExtended(data);
exports.verify = (publicKey, signature, data) =>
	publicKey.verifyExtended(signature, data);

function extractKeyId(signature) {
	const boss = new Boss();
	const unpacked = boss.unpack(signature);
	const { exts } = unpacked;
	const targetSignature = boss.unpack(exts);

	return targetSignature.key;
}

function extractPublicKey(signature) {
  const boss = new Boss();
  const unpacked = boss.unpack(signature);
  const { exts } = unpacked;
  const targetSignature = boss.unpack(exts);

  return new PublicKey("BOSS", targetSignature.pub_key);
}

function keyId(key) {
	const publicKey = key.publicKey || key;

	return publicKey.fingerprint();
}
