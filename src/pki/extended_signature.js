const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const utils = require('../utils');
const PublicKey = require('./public_key');

const { byteStringToArray, arrayToByteString } = utils;

exports.keyId = keyId;
exports.extractKeyId = extractKeyId;
exports.extractPublicKey = extractPublicKey;

exports.sign = (key, data) => key.signExtended(data);
exports.verify = async (publicKey, signature, data) =>
	publicKey.verifyExtended(signature, data);

function extractKeyId(signature) {
	const boss = new Boss();
	const unpacked = boss.unpack(signature);
	const { exts } = unpacked;
	const targetSignature = boss.unpack(exts);

	return targetSignature.key;
}

async function extractPublicKey(signature) {
  const boss = new Boss();
  const unpacked = boss.unpack(signature);
  const { exts } = unpacked;
  const targetSignature = boss.unpack(exts);

  return PublicKey.unpack(targetSignature.pub_key);
}

function keyId(key) {
	return key.fingerprint;
}
