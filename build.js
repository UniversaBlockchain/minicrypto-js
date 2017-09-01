const fs = require('fs');
const webpack = require('webpack');
const forgeConfig = require('./webpack.forge');
const workerConfig = require('./webpack.worker');
const universaConfig = require('./webpack.universa');

webpack([workerConfig, forgeConfig], rewriteWorker);

function rewriteWorker(err, stats) {
	if (err) return console.log(err);

	const quote = /'/g;
	const newline = /\n/g;
	const workerPath = __dirname + '/lib/vendor/worker.js';

	var data = fs.readFileSync(workerPath);
	data = data.toString();
	data = data.replace(quote, '"');
	data = data.replace(newline, ' ');
	data = 'module.exports = \'' + data + '\';';
	fs.writeFile(workerPath, data, buildUniversa);
}

function buildUniversa(err) {
	if (err) return console.log(err);

	webpack(universaConfig, err => {
		if (err) console.log(err);
	});
}
