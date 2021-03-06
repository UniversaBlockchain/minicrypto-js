const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: ['./index.js'],
    output: {
      globalObject: 'this',
      filename: 'universa.min.js',
      path: __dirname + '/dist',
      library: 'Universa',
      libraryTarget: 'umd'
    },
    mode: 'production',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: { mangle: { reserved: ["window"]}} })],
    }
  },
  {
    entry: ['./src/boss/protocol.js'],
    output: {
      globalObject: 'this',
      filename: 'boss.min.js',
      path: __dirname + '/dist',
      library: 'Boss',
      libraryTarget: 'umd'
    },
    mode: 'production',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    }
  }
];
