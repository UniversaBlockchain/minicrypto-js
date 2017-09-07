const PrivateKey = require('./private_key');
const PublicKey = require('./public_key');
const SHA = require('../hash/sha');
const Boss = require('../boss/protocol');
const utils = require('../utils');

const { bytesToHex, hexToBytes, byteStringToBin } = utils;

// module.exports = class ExtendedSignature {
// 	constructor(type, options) {
//     const key = this.key = transit[type].unpack(options);
//     const { n, e, d, p, q, dP, dQ, qInv } = key;

//     this.publicKey = new PublicKey('EXPONENTS', { n, e });
//     this.params = { n, e, d, p, q, dP, dQ, qInv };
//   }
// }

exports.keyId = keyId;

exports.sign = (key, data) => {
	const sha512data = new SHA('512');
	const sha512sign = new SHA('512');
	const boss = new Boss();

	const targetSignature = boss.pack([
		'key', byteStringToBin(keyId(key)),
		'sha512', byteStringToBin(sha512data.get(data)),
		'created_at', (new Date()).toISOString()
	]);

	sha512sign.put(targetSignature);

	return boss.pack([
		'exts', byteStringToBin(targetSignature),
		'sign', byteStringToBin(key.sign(sha512sign))
	]);
}

exports.verify = (key, signature, data) => {
	const boss = new Boss();
	const extSHA = new SHA('512');
	const dataSHA = new SHA('512');
	const unpacked = boss.unpack(signature);

	const exts = unpacked[1];
	const sign = unpacked[3];

	if (key.verify(extSHA.get(exts, 'bytes'), sign)) {
		const targetSignature = boss.unpack(exts);
		const es = {};
		const hash = targetSignature[3];
		es.keyId = targetSignature[1];
		es.createdAt = new Date(targetSignature[5]);
		if (dataSHA.get(data) === hash) return es;
	}

	return null;
}

function keyId(key) {
	var pub = key;

	if (pub instanceof PrivateKey) pub = pub.publicKey;

	return pub.fingerprint();
}
