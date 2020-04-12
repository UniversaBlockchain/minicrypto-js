var Universa = Universa || require('../../index');
var { hexToBytes, bytesToHex, BigInteger } = Universa;
var i = (hex) => new BigInteger(hex, 16);

var oaepSeed = {
  n: i('bbf82f090682ce9c2338ac2b9da871f7368d07eed41043a440d6b6f07454f51fb8dfbaaf035c02ab61ea48ceeb6fcd4876ed520d60e1ec4619719d8a5b8b807fafb8e0a3dfc737723ee6b4b7d93a2584ee6a649d060953748834b2454598394ee0aab12d7b61a51f527a9a41f6c1687fe2537298ca2a8f5946f8e5fd091dbdcb'),
  e: i('11'),
  p: i('eecfae81b1b9b3c908810b10a1b5600199eb9f44aef4fda493b81a9e3d84f632124ef0236e5d1e3b7e28fae7aa040a2d5b252176459d1f397541ba2a58fb6599'),
  q: i('c97fb1f027f453f6341233eaaad1d9353f6c42d08866b1d05a0f2035028b9d869840b41666b42e92ea0da3b43204b5cfce3352524d0416a5a441e700af461503'),
  dP: i('54494ca63eba0337e4e24023fcd69a5aeb07dddc0183a4d0ac9b54b051f2b13ed9490975eab77414ff59c1f7692e9a2e202b38fc910a474174adc93c1f67c981'),
  dQ: i('471e0290ff0af0750351b7f878864ca961adbd3a8a7e991c5c0556a94c3146a7f9803f8f6f8ae342e931fd8ae47a220d1b99a495849807fe39f9245a9836da3d'),
  qInv: i('b06c4fdabb6301198d265bdbae9423b380f271f73453885093077fcd39e2119fc98632154f5883b167a967bf402b4e9e2e0f9656e698ea3666edfb25798039f7'),
  pubPacked: "HggMEbyAu/gvCQaCzpwjOKwrnahx9zaNB+7UEEOkQNa28HRU9R+437qvA1wCq2HqSM7rb81Idu1SDWDh7EYZcZ2KW4uAf6+44KPfxzdyPua0t9k6JYTuamSdBglTdIg0skVFmDlO4KqxLXthpR9SeppB9sFof+JTcpjKKo9ZRvjl/Qkdvcs=",
  originalMessage: hexToBytes('d436e99569fd32a7c8a05bbc90d32c49'),
  encryptedMessage: hexToBytes('1253e04dc0a5397bb44a7ab87e9bf2a039a33d1e996fc82a94ccd30074c95df763722017069e5268da5d1c0b4f872cf653c11df82314a67968dfeae28def04bb6d84b1c31d654a1970e5783bd6eb96a024c2ca2f4a90fe9f2ef5c9c140e5bb48da9536ad8700c84fc9130adea74e558d51a74ddf85d8b50de96838d6063e0955'),
  seed: hexToBytes('aafd12f659cae63489b479e5076ddec2f06cb58f'),
  DB: hexToBytes('da39a3ee5e6b4b0d3255bfef95601890afd807090000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001d436e99569fd32a7c8a05bbc90d32c49'),
  dbMask: hexToBytes('06e1deb2369aa5a5c707d82c8e4e93248ac783dee0b2c04626f5aff93edcfb25c9c2b3ff8ae10e839a2ddb4cdcfe4ff47728b4a1b7c1362baad29ab48d2869d5024121435811591be392f982fb3e87d095aeb40448db972f3ac14eaff49c8c3b7cfc951a51ecd1dde61264'),
  maskedDB: hexToBytes('dcd87d5c68f1eea8f55267c31b2e8bb4251f84d7e0b2c04626f5aff93edcfb25c9c2b3ff8ae10e839a2ddb4cdcfe4ff47728b4a1b7c1362baad29ab48d2869d5024121435811591be392f982fb3e87d095aeb40448db972f3ac14f7bc275195281ce32d2f1b76d4d353e2d'),
  seedMask: hexToBytes('41870b5ab029e657d95750b54c283c08725dbea9'),
  maskedSeed: hexToBytes('eb7a19ace9e3006350e329504b45e2ca82310b26'),
  EM: hexToBytes('eb7a19ace9e3006350e329504b45e2ca82310b26dcd87d5c68f1eea8f55267c31b2e8bb4251f84d7e0b2c04626f5aff93edcfb25c9c2b3ff8ae10e839a2ddb4cdcfe4ff47728b4a1b7c1362baad29ab48d2869d5024121435811591be392f982fb3e87d095aeb40448db972f3ac14f7bc275195281ce32d2f1b76d4d353e2d')
};

oaepSeed.m = calcM();
oaepSeed.d = calcD();

function calcM() {
  const { p, q } = oaepSeed;

  return p.subtract(BigInteger.ONE).multiply(q.subtract(BigInteger.ONE));
}

function calcD() {
  const { e, m } = oaepSeed;

  return e.modInverse(m);
}

if (typeof window !== "undefined") {
  Universa.seed = Universa.seed || {};
  Universa.seed.oaep = oaepSeed;
} else module.exports = oaepSeed;
