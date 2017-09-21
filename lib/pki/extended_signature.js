const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const utils = require('../utils');
const PublicKey = require('./public_key');
const PrivateKey = require('./private_key');

const { byteStringToBin } = utils;

exports.keyId = keyId;
exports.getKeyId = getKeyId;

exports.sign = (key, data) => {
	const boss = new Boss();
	const dataHash = new SHA('512');
	const signHash = new SHA('512');

	const targetSignature = boss.pack({
		'key': byteStringToBin(keyId(key)),
		'sha512': byteStringToBin(dataHash.get(data)),
		'created_at': (new Date()).toISOString()
	});

	signHash.put(targetSignature);

	return boss.pack({
		'exts': byteStringToBin(targetSignature),
		'sign': byteStringToBin(key.sign(signHash))
	});
}

exports.verify = (publicKey, signature, data) => {
	const boss = new Boss();
	const extHash = new SHA('512');
	const dataHash = new SHA('512');
	const unpacked = boss.unpack(signature);
	const { exts, sign } = unpacked;

	const verified = publicKey.verify(extHash.get(exts, 'bytes'), sign);

	if (!verified) return null;

	const targetSignature = boss.unpack(exts);
	const { sha512, key, created_at } = targetSignature;

	if (dataHash.get(data) === sha512) return { key, created_at };

	return null;
}

function getKeyId(signature) {
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
