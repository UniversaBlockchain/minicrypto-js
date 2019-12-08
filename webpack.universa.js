module.exports = [
  {
    entry: ['./index.js'],
    output: {
      filename: 'universa.js',
      path: __dirname + '/dist',
      library: 'Universa',
      libraryTarget: 'umd'
    }
  },
  {
    entry: ['./src/boss/protocol.js'],
    output: {
      filename: 'boss.js',
      path: __dirname + '/dist',
      library: 'Boss',
      libraryTarget: 'umd'
    }
  }
];
