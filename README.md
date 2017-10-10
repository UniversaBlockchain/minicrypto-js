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

