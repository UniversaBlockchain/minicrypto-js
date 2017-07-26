## universa-js/universajs

Cryptographic tools for running in browser.

Supports:
 * [SHA1, SHA256, SHA512](#sha)
 * [HMAC](#hmac)
 * [PBKDF2](#pbkdf2)
 * [RSA OAEP/PSS](#oaep-pss)
 * [AES256, AES512](#aes)

## Installation

    npm install
    npm run build

In folder `build` there will be `universa.js` and `universa.min.js`.
To enable RSA keys generation, you will need provide path to `vendor/worker.js`

## Running tests

    npm run test

Also, open page `test/runner.html` in your browser, to test in a real browser.
