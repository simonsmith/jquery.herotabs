const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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

  plugins: [
    new webpack.BannerPlugin({
      banner: `${pkg.name}\n${pkg.version}\nTested with jQuery 1.10+\n${pkg.repository.url}\nLicense: ${pkg.license}`,
    }),
    new UglifyJsPlugin({
      sourceMap: false,
      compress: true,
    }),
  ],

  externals: {
    jquery: {
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
      root: 'jQuery',
    },
  },
};
