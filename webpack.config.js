const path = require('path');

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'jquery.herotabs.js',
    libraryTarget: 'umd',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },

  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery',
    },
  },
};
