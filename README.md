## universa-js/universajs

Minimalistic Javascript library required to perform basic operations with Universa smart contracts and other objects.

Supports:
 * [SHA family](#sha)
 * [HMAC](#hmac)
 * [PBKDF2](#pbkdf2)
 * [RSA OAEP/PSS](#oaep-pss)
 * [AES256, AES512](#aes)
 * [BOSS](#boss)

## Installation
```bash
npm install
npm run build
```

In folder `build` there will be `universa.js` and `boss.js`.
To enable RSA keys generation, you will need provide path to `vendor/worker.js`

## Running tests
```bash
mocha
```

## Usage

### Universa Capsule tools

Sign capsule

```js
const { Capsule } = Universa;

const newCapsuleBin = Capsule.sign(capsuleBin, privateKey); // Uint8Array
```

Extract signatures

```js
const { Capsule } = Universa;

const signatures = Capsule.getSignatures(capsuleBin); // Array[Uint8Array]
```

Extract signature keys

```js
const { Capsule } = Universa;

const publicKeys = Capsule.getSignatureKeys(capsuleBin); // Array[PublicKey]
```

### Misc

Random byte array for given length

```js
const { randomBytes } = Universa.utils;
const bytes16 = randomBytes(16); // Uint8Array
```

HashId for binary data

```js
const { hashId } = Universa.utils;
const id = hashId(decode64("abc")); // Uint8Array
```

CRC32

```js
const { crc32 } = Universa.utils;
const digest = crc32(decode64("abc")); // Uint8Array
```

### Converters

Convert byte array to hex string and back

```js
    const { bytesToHex, hexToBytes } = Universa.utils;
    const hexString = bytesToHex(uint8arr);  // String
    const bytesArray = hexToBytes(hexString); // Uint8Array
```

Convert plain text to bytes

```js
  const { textToBytes } = Universa.utils;
  textToBytes("one two three") // Uint8Array
```

Convert bytes to base64 and back

```js
const { encode64, decode64 } = Universa.utils;
const bytes = decode64("abc"); // Uint8Array
const base64str = encode64(bytes); // String
```

Convert bytes to base58 and back

```js
const { encode58, decode58 } = Universa.utils;
const bytes = decode58("abc"); // Uint8Array
const base58str = encode58(bytes); // String
```

### SHA

Supports SHA256, SHA512, SHA1, SHA3(256, 384, 512)

Get instant hash value for given byte array

```js
const { SHA } = Universa.hash;

// sha3 identifiers: "3_256", "3_384", "3_512"
const sha256 = new SHA(256);

const resultBytes = sha256.get(textToBytes('somevalue')); // Uint8Array
```

Get hash value for large data

```js
const { SHA } = Universa.hash;
const sha512 = new SHA(512);

sha512.put(dataPart1); // dataPart1 is Uint8Array
sha512.put(dataPart2);
// .....
sha512.put(dataPartFinal);

const resultBytes = sha512.get(); // Uint8Array
```

Get hash value in HEX

```js
const { SHA } = Universa.hash;
const sha256 = new SHA(256);
const hexResult = sha256.get(textToBytes("one two three"), 'hex'); // String
```

### HMAC

```js
const { SHA, HMAC } = Universa.hash;
const data = textToBytes('a quick brown for his done something disgusting');
const key = textToBytes('1234567890abcdef1234567890abcdef');

const sha256 = new SHA('256');
const hmac = new HMAC(sha256, key);
const result = hmac.get(data) // Uint8Array
```

### PBKDF2

```js
const { hexToBytes } = Universa.utils;
const { pbkdf2 } = Universa.pki;
const { SHA } = Universa.hash;

const derivedKey = pbkdf2(new SHA('256'), {
  iterations: 1, // number of iterations
  keyLength: 20  // bytes length
  password: 'password',
  salt: hexToBytes('abc123'),
}); // Uint8Array
```

### RSA Pair, keys helpers

Private key unpack

```js
const { PrivateKey } = Universa.pki;
const { decode64, BigInteger } = Universa.utils;

const bossEncodedKey = decode64(keyPacked64);

const privateKey1 = new PrivateKey('BOSS', bossEncodedKey);
const privateKey2 = new PrivateKey('EXPONENTS', {
  e: new BigInteger(eHex, 16),
  p: new BigInteger(pHex, 16),
  q: new BigInteger(qHex, 16)
});
```

Public key unpack

```js
const { PublicKey, PrivateKey } = Universa.pki;
const { decode64, BigInteger } = Universa.utils;

const bossEncodedKey = decode64(keyPacked64);
const privateKey2 = new PrivateKey('BOSS', privateEncoded);

const publicKey1 = new PublicKey('BOSS', bossEncodedKey);
const publicKey2 = privateKey2.publicKey;
const publicKey3 = new PublicKey('EXPONENTS', {
  n: new BigInteger(nHex, 16),
  e: new BigInteger(eHex, 16),
});
```

Public key fingerprint

```js
publicKey.fingerprint(); // fingerprint (Uint8Array)
```

Public key address

```js
publicKey.address();               // short address (Uint8Array)
publicKey.shortAddress();          // short address (Uint8Array)
publicKey.address({ long: true }); // long address (Uint8Array)
publicKey.longAddress();           // long address (Uint8Array)
```

Generate private key

```js
const { PrivateKey, PublicKey } = Universa.pki;
const { createKeys } = Universa.pki.rsa;

const options = { bits: 2048, e: 0x10001 };

createKeys(options, (err, pair) => {
  console.log(pair.publicKey instanceof PublicKey); // true
  console.log(pair.privateKey instanceof PrivateKey); // true
});
```

Private(public) key - export

```js
const { PrivateKey } = Universa.pki;
const bossEncodedKey = decode64(keyPacked64);

const priv = new PrivateKey('BOSS', bossEncodedKey);

const hashWithExponents = priv.pack('EXPONENTS'); // hash map with exponents
const bossEncoded = priv.pack('BOSS'); // Uint8Array
```

### KEY INFO

Contains information about Key and helper to match keys compatibility

Supported algorithms: RSAPublic, RSAPrivate, AES256
Supported PRF: HMAC_SHA1, HMAC_SHA256, HMAC_SHA512

```js
const { KeyInfo} = Universa.pki;
const keyInfo = new KeyInfo({
  algorithm: KeyInfo.Algorithm.AES256,
  tag: decode64("abc"), // Uint8Array
  keyLength: 32,        // Int
  prf: KeyInfo.PRF.HMAC_SHA256,
  rounds: 16000,        // number of iterations
  salt: decode64("bcd") // Uint8Array
});

```

Pack to BOSS

```js
const packed = keyInfo.pack(); // Uint8Array
```

Read from BOSS

```js
// bossEncoded is Uint8Array
const keyInfo = KeyInfo.unpack(bossEncoded); // KeyInfo
```

Check that this key can decrypt other key

```js
const canDecrypt = keyInfo.matchType(otherKeyInfo); // boolean
```

Derived key from password

```js
const derivedKey = keyInfo.derivePassword("somepassword"); // Uint8Array
```

### SYMMETRIC KEY

Symmetric key: main interface to the symmetric cipher.
This implementation uses AES256 in CTR mode with IV to encrypt / decrypt.

```js
// Creates random key (AES256, CTR)
const symmetricKey = new SymmetricKey();

// Creates key by derived key (Uint8Array) and it's info (KeyInfo)
const symmetricKey2 = new SymmetricKey({
  keyBytes: derivedKey,
  keyInfo: keyInfo
});

// Creates key by password (String) and number of rounds (Int). Salt is optional
// Uint8Array, null by default
const symmetricKey3 = SymmetricKey.fromPassword(password, rounds, salt);
```

Encrypt / decrypt data with AES256 in CRT mode with IV

```js
// data is Uint8Array
const encrypted = symmetricKey.encrypt(data); // Uint8Array
const decrypted = symmetricKey.decrypt(encrypted); // Uint8Array
```

Encrypt / decrypt data with EtA using Sha256-based HMAC

```js
// data is Uint8Array
const encrypted = symmetricKey.etaEncrypt(data); // Uint8Array
const decrypted = symmetricKey.etaDecrypt(encrypted); // Uint8Array
```

### RSA OAEP/PSS


OAEP encrypt/decrypt

```js
const privateKey; // some PrivateKey instance
const publicKey = privateKey.publicKey;

// encrypt data
const data = decode64("abc123");
const options = {
  seed: decode64("abcabc"), // optional, default none
  mgf1Hash: new SHA(512), // optional, default SHA(256)
  oaepHash: new SHA(512) // optional, default SHA(256)
};
const encrypted = publicKey.encrypt(data, options);
const decrypted = privateKey.decrypt(encrypted, options);

encode64(data) === encode64(decrypted); // true
```

PSS sign/verify

```js
const privateKey; // some PrivateKey instance
const publicKey = privateKey.publicKey;

const options = {
  salt: decode64("abcabc"), // optional
  saltLength: null, // optional, numeric
  mgf1Hash: new SHA(512), // optional, default SHA(256)
  pssHash: new SHA(512) // optional, default SHA(256)
};

const message = 'abc123';

const signature = privateKey.sign(message, options);
const isCorrect = publicKey.verify(message, signature, options);
console.log(isCorrect); // true
```

### Extended signature

Sign/verify

```js
const { ExtendedSignature } = Universa.pki;
const data = decode64("abcde12345");
const privateKey; // some PrivateKey instance
const publicKey = privateKey.publicKey;

const signature = ExtendedSignature.sign(key, data);
const es = ExtendedSignature.verify(publicKey, signature, data);

const isCorrect = !!es;
console.log(es.created_at); // Date - signature created at
console.log(es.key); // Uint8Array - PublicKey fingerprint
console.log(ExtendedSignature.extractPublicKey(signature)); // PublicKey instance
```

### BOSS

Encode/decode

```js
const { Boss } = Universa;
const boss = new Boss();

const data = {
  a: decode64("abc")
  b: new Date(),
  c: [1, 2, 'test'],
  d: { a: 1 }
};

const encoded = boss.dump(data); // Uint8Array
const decoded = boss.load(encoded); // original data
```

Encode stream

```js
const writer = new Boss.writer();

writer.write(0);
writer.write(1);
writer.write(2);
writer.write(3);

const dump = writer.get(); // Uint8Array
```

Decode stream

```js
const reader = new Boss.reader(hexToBytes('00081018'));

const arg1 = reader.read(); // 0
const arg2 = reader.read(); // 1
const arg3 = reader.read(); // 2
const arg4 = reader.read(); // 3
const arg5 = reader.read(); // undefined
```

### AES

Encrypt/decrypt

```js
const { AES } = Universa.cipher;
const key = decode64("abc"); // 16 bytes for aes128, 32 bytes for aes256
const message = textToBytes('some text');

const aes256 = new AES(key);
const encrypted = aes256.encrypt(message);   // Uint8Array
const decrypted = aes256.decrypt(encrypted); // Uint8Array
```

### NOTES

node-forge has broken method for encoding bytes, it should be replaced with:

```js
util.binary.raw.encode = function(bytes) {
  return bytes.reduce(function (data, byte) {
    return data + String.fromCharCode(byte);
  }, '');
};
```
