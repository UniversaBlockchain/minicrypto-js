rm test/browser/universa.min.js
rm test/browser/crypto.js
rm test/browser/crypto.wasm
cp dist/universa.min.js test/browser
cp src/vendor/wasm/crypto.js test/browser
cp src/vendor/wasm/crypto.wasm test/browser
