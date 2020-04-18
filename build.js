const fs = require('fs');
const webpack = require('webpack');
const universaConfig = require('./webpack.universa');

function build(config) {
  return new Promise((resolve, reject) => {
	  webpack(config, err => err ? reject(err) : resolve());
  });
}

build(universaConfig).then(
    () => console.log("Done without errors."),
    (err) => console.log(`Done with errors: ${err}`)
  );

