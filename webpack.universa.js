module.exports = [
  {
    entry: ['./index.js'],
    output: {
      filename: 'universa.js',
      path: __dirname + '/build',
      library: 'Universa',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        }
      ]
    }
  },
  {
    entry: ['./lib/boss/protocol.js'],
    output: {
      filename: 'boss.js',
      path: __dirname + '/build',

      library: 'Boss',
      libraryTarget: 'umd'
    },
    module: {
      loaders: [
        { loader: 'babel-loader' }
      ],
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['es2015'],
              plugins: ['transform-es2015-modules-amd']
            }
          }
        }
      ]
    }
  }
];
