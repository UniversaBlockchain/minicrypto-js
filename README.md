## universa-wasm

Minimalistic Javascript library required to perform basic operations with Universa smart contracts and other objects. WASM version

Supports:
 * [SHA family](#sha)
 * [HMAC](#hmac)
 * [PBKDF2](#pbkdf2)
 * [RSA OAEP/PSS](#oaep-pss)
 * [AES256, AES512](#aes)
 * [BOSS](#boss)

## Installation

### Node.js

For usage in an existing Node.js project, add it to your dependencies:

```
$ npm install UniversaBlockchain/minicrypto-js#feature/wasm
```

or with yarn:

```
$ yarn add UniversaBlockchain/minicrypto-js#feature/wasm
```


And use it with the following line wherever you need it:

```javascript
const Universa = require('universa-minicrypto');
```

### Web

In root folder of package run

```bash
npm install
npm run build
```

In folder `dist` there will be `universa.min.js` and `boss.min.js`. Also there will be \*.LICENSE files.

Simply copy `dist/universa.min.js` to wherever you keep your vendor scripts and include
it as a script:

```html
<script src="path/to/universa.min.js"></script>
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

### Signed record

Pack data to signed record (Uint8Array) with key:

```js
const { SignedRecord, decode64, PrivateKey } = Universa;

const payload = { ab: "cd" };
const nonce = decode64("abc");
const key = PrivateKey.unpack(privateKeyPacked);

const recordBinary = SignedRecord.packWithKey(key, payload, nonce); // Uint8Array
```

Unpack signed record:

```js
const { SignedRecord, decode64, PrivateKey } = Universa;

const payload = { ab: "cd" };
const nonce = decode64("abc");
const key = PrivateKey.unpack(privateKeyPacked);

const recordBinary = SignedRecord.packWithKey(key, payload, nonce); // Uint8Array

const record = SignedRecord.unpack(recordBinary);

record.recordType === SignedRecord.RECORD_WITH_KEY; // true
record.nonce // nonce
record.payload // payload
record.key // PublicKey
```

### Misc

Random byte array for given length

```js
const { randomBytes } = Universa;
const bytes16 = randomBytes(16); // Uint8Array
```

HashId for binary data

```js
const { hashId } = Universa;
const id = hashId(decode64("abc")); // Uint8Array
```

CRC32

```js
const { crc32 } = Universa;
const digest = crc32(decode64("abc")); // Uint8Array
```

### Converters

Convert byte array to hex string and back

```js
    const { bytesToHex, hexToBytes } = Universa;
    const hexString = bytesToHex(uint8arr);  // String
    const bytesArray = hexToBytes(hexString); // Uint8Array
```

Convert plain text to bytes and back

```js
  const { textToBytes, bytesToText } = Universa;
  const bytes = textToBytes("one two three"); // Uint8Array
  const text = bytesToText(bytes); // "one two three"
```

Convert bytes to base64 and back

```js
const { encode64, encode64Short, decode64 } = Universa;
const bytes = decode64("abc"); // Uint8Array
const base64str = encode64(bytes); // String

// short representation of base64 string
const base64ShortString = encode64Short(bytes);
```

Convert bytes to base58 and back

```js
const { encode58, decode58 } = Universa;
const bytes = decode58("abc"); // Uint8Array
const base58str = encode58(bytes); // String
```

### SHA

Supports SHA256, SHA512, SHA1, SHA3(256, 384, 512)

Get instant hash value for given byte array

```js
const { SHA } = Universa;

// sha3 identifiers: "3_256", "3_384", "3_512"
const sha256 = new SHA(256);

const resultBytes = await sha256.get(textToBytes('somevalue')); // Uint8Array
```

Get hash value for large data

```js
const { SHA } = Universa;
const sha512 = new SHA(512);

sha512.put(dataPart1); // dataPart1 is Uint8Array
sha512.put(dataPart2);
// .....
sha512.put(dataPartFinal);

const resultBytes = await sha512.get(); // Uint8Array
```

Get hash value in HEX

```js
const { SHA } = Universa;
const sha256 = new SHA(256);
const hexResult = await sha256.get(textToBytes("one two three"), 'hex'); // String
```

### HMAC

```js
const { SHA, HMAC } = Universa;
const data = textToBytes('a quick brown for his done something disgusting');
const key = textToBytes('1234567890abcdef1234567890abcdef');

const sha256 = new SHA('256');
const hmac = new HMAC(sha256, key);
const result = hmac.get(data) // Uint8Array
```

### PBKDF2

```js
const { hexToBytes, pbkdf2, SHA } = Universa;

const derivedKey = pbkdf2(new SHA('256'), {
  rounds: 1, // number of iterations
  keyLength: 20,  // bytes length
  password: 'password',
  salt: hexToBytes('abc123')
}); // Uint8Array
```

### RSA Pair, keys helpers

Private key unpack

```js
const { PrivateKey, decode64, BigInteger } = Universa;

const bossEncodedKey = decode64(keyPacked64);

const privateKey1 = new PrivateKey('BOSS', bossEncodedKey);
const privateKey2 = PrivateKey.unpack(bossEncodedKey);
const privateKey3 = new PrivateKey('EXPONENTS', {
  e: new BigInteger(eHex, 16),
  p: new BigInteger(pHex, 16),
  q: new BigInteger(qHex, 16)
});

// Read password-protected key
const privateKey4 = new PrivateKey('BOSS', {
  bin: bossEncodedKey,
  password: "somepassword"
})
const privateKey5 = PrivateKey.unpack(bossEncodedKey, password);
```

Public key unpack

```js
const { PublicKey, PrivateKey, decode64, BigInteger } = Universa;

const bossEncodedKey = decode64(keyPacked64);
const privateKey2 = new PrivateKey('BOSS', privateEncoded);

const publicKey1 = new PublicKey('BOSS', bossEncodedKey);
const publicKey2 = privateKey2.publicKey;
const publicKey3 = new PublicKey('EXPONENTS', {
  n: new BigInteger(nHex, 16),
  e: new BigInteger(eHex, 16),
});
const publicKey4 = PublicKey.unpack(bossEncodedKey);
```

Public key fingerprint

```js
publicKey.fingerprint(); // fingerprint (Uint8Array)
```

Public key bit strength

```js
publicKey.getBitStrength(); // number
```

Public key address

```js
publicKey.address();               // short address (Uint8Array)
publicKey.shortAddress();          // short address (Uint8Array)
publicKey.address({ long: true }); // long address (Uint8Array)
publicKey.longAddress();           // long address (Uint8Array)
```

Check if given address is valid

```js
const { PublicKey } = Universa;

PublicKey.isValidAddress(publicKey.address()) // true

// accepts base58 representation of address too
PublicKey.isValidAddress(addressBase58) // true

```

Generate private key

```js
const { PrivateKey, PublicKey, createKeys } = Universa;

const options = { bits: 2048, e: 0x10001 };

createKeys(options, (err, pair) => {
  console.log(pair.publicKey instanceof PublicKey); // true
  console.log(pair.privateKey instanceof PrivateKey); // true
});
```

Private(public) key - export

```js
const { PrivateKey } = Universa;
const bossEncodedKey = decode64(keyPacked64);

const priv = new PrivateKey('BOSS', bossEncodedKey);

const hashWithExponents = priv.pack('EXPONENTS'); // hash map with exponents
const bossEncoded = priv.pack('BOSS'); // Uint8Array

const bossEncodedPublic = priv.publicKey.packed;
```

Password-protected Private key export

```js
// default pbkdf2 rounds = 160000
const bossEncoded = privateKey.pack("BOSS", "somepassword");

// use custom pbkdf2 rounds
const bossEncodedFast = privateKey.pack("BOSS", {
  password: "somepassword",
  rounds: 16000
});
```

Get type of key package. There are 4 types of what key binary package may contain.

AbstractKey.TYPE_PRIVATE - binary package of private key without password
AbstractKey.TYPE_PUBLIC - binary package of public key without password
AbstractKey.TYPE_PRIVATE_PASSWORD_V2 - binary package of private key with password (actual version)
AbstractKey.TYPE_PRIVATE_PASSWORD_V1 - binary package of private key with password (deprecated version)

```js
const { AbstractKey } = Universa;

const bossEncoded = privateKey.pack("BOSS", "somepassword");

AbstractKey.typeOf(bossEncoded) === AbstractKey.TYPE_PRIVATE_PASSWORD_V2 // true
```

### KEY INFO

Contains information about Key and helper to match keys compatibility

Supported algorithms: RSAPublic, RSAPrivate, AES256

Supported PRF: HMAC_SHA1, HMAC_SHA256, HMAC_SHA512

```js
const { KeyInfo} = Universa;
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
const { SymmetricKey } = Universa;

// Creates random key (AES256, CTR)
const symmetricKey = new SymmetricKey();

// Creates key by derived key (Uint8Array) and it's info (KeyInfo)
const symmetricKey2 = new SymmetricKey({
  keyBytes: derivedKey,
  keyInfo: keyInfo
});

// Creates key by derived key (Uint8Array)
const symmetricKey2 = new SymmetricKey({
  keyBytes: derivedKey
});

// Creates key by password (String) and number of rounds (Int). Salt is optional
// Uint8Array, null by default
const symmetricKey3 = SymmetricKey.fromPassword(password, rounds, salt);
```

Pack symmetric key (get derived key bytes)

```js
const { SymmetricKey } = Universa;

// Creates random key (AES256, CTR)
const symmetricKey = new SymmetricKey();

const derivedKey = symmetricKey.pack(); // Uint8Array
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

You can pass hash types with instances or with string types. Supported types for SHA:
sha1
sha256
sha384
sha512
sha512/256
sha3_256
sha3_384
sha3_512

```js
const privateKey; // some PrivateKey instance
const publicKey = privateKey.publicKey;

// encrypt data
const data = decode64("abc123");
const options = {
  seed: decode64("abcabc"), // optional, default none
  mgf1Hash: new SHA(512), // optional, default SHA(256)
  oaepHash: 'sha512' // optional, default SHA(256)
};
const encrypted = publicKey.encrypt(data, options);
const decrypted = privateKey.decrypt(encrypted, options);

encode64(data) === encode64(decrypted); // true
```

OAEP max encryption message length

```js
const privateKey; // some PrivateKey instance
const publicKey = privateKey.publicKey;

// encrypt data
const options = {
  seed: decode64("abcabc"), // optional, default none
  mgf1Hash: 'SHA512', // optional, default SHA(256)
  oaepHash: 'SHA512' // optional, default SHA(256)
};

const maxLength = publicKey.encryptionMaxLength(options);
```

OAEP default hash

```js
publicKey.DEFAULT_OAEP_HASH // SHA1 instance
```

MGF1 default hash

```js
publicKey.DEFAULT_MGF1_HASH // SHA1 instance
```

PSS sign/verify

You can pass hash types with instances or with string types. Supported types for SHA:
sha1
sha256
sha384
sha512
sha512/256
sha3_256
sha3_384
sha3_512

```js
const privateKey; // some PrivateKey instance
const publicKey = privateKey.publicKey;

const options = {
  salt: decode64("abcabc"), // optional
  saltLength: null, // optional, numeric
  mgf1Hash: 'sha512', // optional, default SHA(256)
  pssHash: 'sha512' // optional, default SHA(256)
};

const message = 'abc123';

const signature = privateKey.sign(message, options);
const isCorrect = publicKey.verify(message, signature, options);
console.log(isCorrect); // true
```

### Extended signature

Sign/verify

```js
const { ExtendedSignature } = Universa;
const data = decode64("abcde12345");
const privateKey; // some PrivateKey instance
const publicKey = privateKey.publicKey;

const signature = privateKey.signExtended(data);
const es = publicKey.verifyExtended(signature, data);

const isCorrect = !!es;
console.log(es.created_at); // Date - signature created at
console.log(es.key); // Uint8Array - PublicKey fingerprint
console.log(ExtendedSignature.extractPublicKey(signature)); // PublicKey instance
```

### BOSS

Encode/decode

```js
const { Boss } = Universa;
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
const { AES } = Universa;
const key = decode64("abc"); // 16 bytes for aes128, 32 bytes for aes256
const message = textToBytes('some text');

const aes256 = new AES(key);
const encrypted = aes256.encrypt(message);   // Uint8Array
const decrypted = aes256.decrypt(encrypted); // Uint8Array
```

## Create bundle

Run in package root folder

```bash
npm install
npm run build
```

In folder `dist` there will be `universa.min.js` and `boss.min.js`. Also there will be \*.LICENSE files.

## Running tests
```bash
npm test
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
