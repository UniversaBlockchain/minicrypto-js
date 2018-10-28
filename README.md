## universa-js/universajs

Cryptographic tools for running in browser.

Supports:
 * [SHA1, SHA256, SHA512](#sha)
 * [HMAC](#hmac)
 * [PBKDF2](#pbkdf2)
 * [RSA OAEP/PSS](#oaep-pss)
 * [AES256, AES512](#aes)
 * [BOSS](#boss)

## Installation

    npm install
    npm run build

In folder `build` there will be `universa.js` and `universa.min.js`.
To enable RSA keys generation, you will need provide path to `vendor/worker.js`

## Running tests

    npm run test

Also, open page `test/runner.html` in your browser, to test in a real browser.

## Usage

### Misc

    // returns random bytestring for given length
    var randomBytes = Universa.utils.randomBytes;
    var key16bytes = randomBytes(16);


### Converters

    // byte string <-> hex
    var bytesToHex = Universa.utils.bytesToHex;
    var hexToBytes = Universa.utils.hexToBytes;

    // byte string <-> Uint8Array
    var bytesToArray = Universa.utils.bytesToArray;
    var arrayToBytes = Universa.utils.arrayToBytes;

    // byte string -> Buffer
    var bytesToBuffer = Universa.utils.bytesToBuffer;

### SHA

Supports SHA256, SHA512, SHA1.

Get instant hash value

    var SHA = Universa.hash.SHA;
    var sha256 = new SHA(256);

    var resultBytes = sha256.get('somevalue');

Get hash value for large data

    var SHA = Universa.hash.SHA;
    var sha512 = new SHA(512);

    sha512.put('chunk1');
    sha512.put('chunk2');

    var resultBytes = sha512.get();

Get hash value in HEX

    var SHA = Universa.hash.SHA;

    var sha256 = new SHA(256);
    var resultBytes = sha256.get('somevalue', 'hex');

### HMAC

Supports SHA256, SHA512, SHA1.

Example

    var SHA = Universa.hash.SHA;
    var HMAC = Universa.hash.HMAC;
    var key = 'my secret key';

    var hmac = new HMAC(new SHA(256), key);
    var resultBytes = hmac.get('my secret data');

### PBKDF2

Example

    var hexToBytes = Universa.utils.hexToBytes;
    var pbkdf2 = Universa.pki.pbkdf2;
    var SHA = Universa.hash.SHA;

    var derivedKey = pbkdf2(new SHA('256'), {
      iterations: 1,
      keyLength: 20
      password: 'password',
      salt: hexToBytes('abc123'),
    });

### RSA Pair, keys helpers

Private key - import

    var PrivateKey = Universa.pki.privateKey;
    var bossEncodedKey = '/* byte string */';

    var privateKey1 = new PrivateKey('BOSS', bossEncodedKey);
    var privateKey2 = new PrivateKey('EXPONENTS', {
      e: '/* byte string */',
      p: '/* byte string */',
      q: '/* byte string */'
    });

Public key - import

    var PublicKey = Universa.pki.publicKey;
    var bossEncodedKey = '/* byte string */';
    var privateKey2 = new PrivateKey('BOSS', privateEncoded);

    var publicKey1 = new PublicKey('BOSS', bossEncodedKey);
    var publicKey2 = privateKey2.publicKey;
    var publicKey3 = new PublicKey('EXPONENTS', {
      n: '/* byte string */',
      e: '/* byte string */'
    });

Public key - fingerprint

    var publicKey1; // some PublicKey instance

    console.log(publicKey1.fingerprint()); // fingerprint


Pair - creation

    var PrivateKey = Universa.pki.privateKey;
    var PublicKey = Universa.pki.publicKey;

    var createKeys = Universa.pki.rsa.createKeys;

    var options = { bits: 2048, e: 0x10001 };

    createKeys(options, (err, pair) => {
      console.log(pair.publicKey instanceof PublicKey); // true
      console.log(pair.privateKey instanceof PrivateKey); // true
    });

Private(public) key - export

    var PrivateKey = Universa.pki.privateKey;
    var bossEncodedKey = '/* byteString */';

    var privateKey1 = new PrivateKey('BOSS', bossEncodedKey);

    var hashWithExponents = privateKey1.pack('EXPONENTS');
    var bossEncoded = privateKey1.pack('BOSS');

### RSA OAEP/PSS


OAEP encrypt/decrypt

    var privateKey; // some PrivateKey instance
    var publicKey = privateKey.publicKey;

    // encrypt data
    var data = '/* byte string */';
    var options = {
        seed: '/* byte string */', // optional, default none
        mgf1Hash: new SHA(512), // optional, default SHA(256)
        oaepHash: new SHA(512) // optional, default SHA(256)
    };
    var encrypted = publicKey.encrypt(data, options);
    var decrypted = privateKey.decrypt(encrypted, options);

    console.log(data === decrypted); // true

PSS sign/verify

    var privateKey; // some PrivateKey instance
    var publicKey = privateKey.publicKey;

    var options = {
      salt: '/* byte string */', // optional
      saltLength: null, // optional, numeric
      mgf1Hash: new SHA(512), // optional, default SHA(256)
      pssHash: new SHA(512) // optional, default SHA(256)
    };

    var message = 'abc123';

    var signature = privateKey.sign(message, options);
    var isCorrect = publicKey.verify(message, signature, options);
    console.log(isCorrect); // true

### Extended signature

Sign/verify

    var ExtendedSignature = Universa.pki.extendedSignature;
    var data = '/* byte string */';
    var privateKey; // some PrivateKey instance
    var publicKey = privateKey.publicKey;

    var signature = ExtendedSignature.sign(key, data);
    var es = ExtendedSignature.verify(publicKey, signature, data);

    var isCorrect = !!es;
    console.log(es.created_at); // signature created at
    console.log(es.key); // fingerprint
    console.log(ExtendedSignature.extractKeyId(signature)); // fingerprint
    console.log(ExtendedSignature.keyId(publicKey)); // fingerprint

### BOSS

Encode/decode

    var bytesToBuffer = Universa.utils.bytesToBuffer;
    var Boss = Universa.boss;
    var boss = new Boss();

    // IMPORTANT: you should wrap byte string into buffer, before passing it to boss formatter
    var data = {
        a: bytesToBuffer('/* some byte string */')
        b: new Date(),
        c: [1, 2, 'test'],
        d: { a: 1 }
    };

    var encoded = boss.dump(data);
    var decoded = boss.load(encoded);

Encode stream

    const writer = new Boss.writer();

    writer.write(0);
    writer.write(1);
    writer.write(2);
    writer.write(3);

    const dump = writer.get();

    // bytesToHex(dump) === '00081018' - true

Decode stream

    const reader = new Boss.reader(hexToBytes('00081018'));

    const arg1 = reader.read(); // 0
    const arg2 = reader.read(); // 1
    const arg3 = reader.read(); // 2
    const arg4 = reader.read(); // 3
    const arg5 = reader.read(); // undefined

### AES

Encrypt/decrypt

    var AES = Universa.cipher.AES;
    var key = '/* 16 byte string */'; // 16 bytes for aes128, 32 bytes for aes256
    var message = 'some text';

    var aes256 = new AES(key);
    var encrypted = aes256.encrypt(message);
    var decrypted = aes256.decrypt(encrypted);

### NOTES

forge has broken method for encoding bytes, it should be replaced with:

util.binary.raw.encode = function(bytes) {
  return bytes.reduce(function (data, byte) {
    return data + String.fromCharCode(byte);
  }, '');
};
