const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const utils = require('../utils');
const PublicKey = require('./public_key');
const PrivateKey = require('./private_key');

const { bytesToHex, hexToBytes, byteStringToBin } = utils;

exports.keyId = keyId;

exports.sign = (key, data) => {
	const boss = new Boss();
	const dataHash = new SHA('512');
	const signHash = new SHA('512');

	const targetSignature = boss.pack([
		'key', byteStringToBin(keyId(key)),
		'sha512', byteStringToBin(dataHash.get(data)),
		'created_at', (new Date()).toISOString()
	]);

	signHash.put(targetSignature);

	return boss.pack([
		'exts', byteStringToBin(targetSignature),
		'sign', byteStringToBin(key.sign(signHash))
	]);
}

exports.verify = (key, signature, data) => {
	const boss = new Boss();
	const extHash = new SHA('512');
	const dataHash = new SHA('512');
	const unpacked = boss.unpack(signature);

	const exts = unpacked[1];
	const sign = unpacked[3];

	const verified = key.verify(extHash.get(exts, 'bytes'), sign);

	if (!verified) return null;

	const targetSignature = boss.unpack(exts);
	const hash = targetSignature[3];

	if (dataHash.get(data) === hash) return {
		keyId: targetSignature[1],
		createdAt: new Date(targetSignature[5])
	};

	return null;
}

function keyId(key) {
	var pub = key;

	if (pub instanceof PrivateKey) pub = pub.publicKey;

	return pub.fingerprint();
}
