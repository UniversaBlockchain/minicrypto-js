const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const utils = require('../utils');
const PublicKey = require('./public_key');
const PrivateKey = require('./private_key');

const { byteStringToBin, bytesToArray, arrayToBytes } = utils;

exports.keyId = keyId;
exports.extractKeyId = extractKeyId;

exports.sign = (key, data) => {
	const boss = new Boss();
	const dataHash = new SHA('512');

	const targetSignature = boss.dump({
		'key': keyId(key),
		'sha512': dataHash.get(data),
		'created_at': new Date(),
    'pub_key': key.publicKey.pack('BOSS')
	});

	return boss.dump({
		'exts': targetSignature,
		'sign': key.sign(targetSignature, { pssHash: new SHA(512), mgf1Hash: new SHA(1) })
	});
}

exports.verify = (publicKey, signature, data) => {
	const boss = new Boss();
	const dataHash = new SHA('512');
	const unpacked = boss.load(signature);
	const { exts, sign } = unpacked;

	const verified = publicKey.verify(exts, sign, { pssHash: new SHA(512), mgf1Hash: new SHA(1) });

	if (!verified) return null;

	const targetSignature = boss.load(exts);
	const { sha512, key, created_at } = targetSignature;

	if (arrayToBytes(dataHash.get(data)) === arrayToBytes(sha512)) return { key, created_at };

	return null;
}

function extractKeyId(signature) {
	const boss = new Boss();
	const unpacked = boss.unpack(signature);
	const { exts } = unpacked;
	const targetSignature = boss.unpack(exts);

	return targetSignature.key;
}

function keyId(key) {
	const publicKey = key.publicKey || key;

	return publicKey.fingerprint();
}
