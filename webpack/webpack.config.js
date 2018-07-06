const path = require("path")
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { VueLoaderPlugin} = require('vue-loader')
const VueLoaderOptionsPlugin = require('vue-loader-options-plugin')

module.exports = {
  entry: "./src/index.js",
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle-[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
          test: /\.(jpg|jpeg|png|gif|svg|eot|ttf|woff|woff2|swf)$/i,
          loader: 'file-loader'
      },
      {
        test: /\.(css|sass|scss)$/,
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new VueLoaderOptionsPlugin({
      babel: {
        babelrc: false,
        extends: path.resolve('.babelrc')
      }
    }),
    new ExtractTextPlugin({
      filename: 'bundle-[name].css',
      allChunks: true
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ])
}
