module.exports = [
  {
    entry: forgeModules([
      'sha256',
      'sha512',
      'hmac',
      'pbkdf2',
      'aes',
      'pki',
      'rsa',
      'forge'
    ]),
    output: {
      filename: 'forge.js',
      path: __dirname + '/vendor',
      libraryTarget: 'umd'
    }
  },
  {
    entry: forgeModules(['prime.worker']),
    output: {
      filename: 'worker.js',
      path: __dirname + '/vendor',
      libraryTarget: 'umd'
    }
  },
  {
    entry: [
      './index.js'
    ],
    output: {
      filename: 'universajs.js',
      path: __dirname + '/build'
    }
  }
];

function forgeModules(list) {
  return list.map(entry => `./node_modules/node-forge/lib/${entry}.js`);
}
