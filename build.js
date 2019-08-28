const fs = require('fs');
const webpack = require('webpack');
const forgeConfig = require('./webpack.forge');
const universaConfig = require('./webpack.universa');

function rewriteWorker() {
  return new Promise((resolve, reject) => {
  	const quote = /'/g;
  	const newline = /\n/g;
  	const comment = /\/\/.+\n/g;
  	const workerPath = __dirname + '/lib/vendor/worker.js';

  	var data = fs.readFileSync(workerPath);
  	data = data.toString();
  	data = data.replace(quote, '"');
  	data = data.replace(comment, " ");
  	data = data.replace(newline, ' ');
  	data = 'module.exports = \'' + data + '\';';

  	fs.writeFile(workerPath, data, () => resolve());
  });
}

function build(config) {
  return new Promise((resolve, reject) => {
	 webpack(config, err => err ? reject(err) : resolve());
  });
}

build(forgeConfig)
  .then(() => build(universaConfig))
  .then(rewriteWorker)
  .then(
    () => console.log("Done without errors."),
    (err) => console.log(`Done with errors: ${err}`)
  );

// new Promise(buildForge)
//   .then(buildUniversa)
//   .then(rewriteWorker)
//   .then(
//     () => console.log("Done without errors."),
//     (err) => console.log(`Done with errors: ${err}`)
//   );


