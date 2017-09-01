module.exports = {
  entry: './node_modules/node-forge/lib/prime.worker.js',
  output: {
    filename: 'worker.js',
    path: __dirname + '/lib/vendor',
    libraryTarget: 'umd'
  }
};
