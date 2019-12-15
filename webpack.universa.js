const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: ['./index.js'],
    output: {
      filename: 'universa.min.js',
      path: __dirname + '/dist',
      library: 'Universa',
      libraryTarget: 'umd'
    },
    mode: 'production',
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    }
  },
  {
    entry: ['./src/boss/protocol.js'],
    output: {
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
