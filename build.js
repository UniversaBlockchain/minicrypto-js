const fs = require('fs');
const webpack = require('webpack');
const universaConfig = require('./webpack.universa');

function rewriteWASM() {
  return new Promise((resolve, reject) => {
  	const quote = /'/g;
  	const newline = /\n/g;
  	const comment = /\/\/.+\n/g;
  	const wasmPath = __dirname + '/src/vendor/wasm/crypto.js';

  	var data = fs.readFileSync(wasmPath);
    data = data.toString();
  	// const parts = data.split('run();');
    // console.log(parts);
    data += 'Module.isReady = new Promise(resolve => { Module.onRuntimeInitialized = resolve; });';
    // parts.push('run();');
    // data = parts.join('');
  	// data = 'module.exports = \'' + data + '\';';
    console.log("write file");
  	fs.writeFile('dist/crypto.js', data, () => resolve());
  });
}

function build(config) {
  return new Promise((resolve, reject) => {
	  webpack(config, err => err ? reject(err) : resolve());
  });
}

build(universaConfig)
  // .then(rewriteWASM)
  .then(
    () => console.log("Done without errors."),
    (err) => console.log(`Done with errors: ${err}`)
  );

