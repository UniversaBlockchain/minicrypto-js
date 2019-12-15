const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: forgeModules(['prime.worker']),
    output: {
      filename: 'worker.js',
      path: __dirname + '/src/vendor',
      libraryTarget: 'umd'
    },
    mode: 'production',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    }
  }
];

function forgeModules(list) {
  return list.map(entry => `./node_modules/node-forge/lib/${entry}.js`);
}
