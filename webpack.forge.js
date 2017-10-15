module.exports = [
  {
    entry: forgeModules([
      'sha256',
      'sha512',
      'hmac',
      'pbkdf2',
      'pki',
      'rsa',
      'forge'
    ]),
    output: {
      filename: 'forge.js',
      path: __dirname + '/lib/vendor',
      libraryTarget: 'umd'
    }
  },
  {
    entry: forgeModules([
      'jsbn'
    ]),
    output: {
      filename: 'jsbn.js',
      path: __dirname + '/lib/vendor',
      libraryTarget: 'umd'
    }
  },
  {
    entry: forgeModules(['prime.worker']),
    output: {
      filename: 'worker.js',
      path: __dirname + '/lib/vendor',
      libraryTarget: 'umd'
    }
  }
];

function forgeModules(list) {
  return list.map(entry => `./node_modules/node-forge/lib/${entry}.js`);
}
