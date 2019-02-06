const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CONFIG = require('./constants/config');
const path = require('path');

module.exports = {
  mode: CONFIG.PROD ? 'production' : 'development',

  entry: './lib/index.ts',

  output: {
    publicPath: '/static/',
    filename: CONFIG.PROD ? '[name].[hash].js' : '[name].js',
    pathinfo: false,
    path: path.resolve(__dirname, 'dist')
  },

  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'components'),
          path.resolve(__dirname, 'constants'),
          path.resolve(__dirname, 'lib')
        ],
        exclude: /node_modules/,
        options: {
          presets: [
            ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: [
                    'last 2 Chrome versions',
                    'last 2 Firefox versions'
                    // 'last 1 iOS versions',
                    // 'last 1 Android versions'
                  ]
                }
              }
            ],
            '@babel/preset-react'
          ],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            'react-hot-loader/babel'
          ]
        }
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: { publicPath: '/static' }
          }
        ]
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(CONFIG.PROD ? 'production' : 'development')
      }
    }),
    new HtmlWebpackPlugin({
      title: 'Send & Receive Mail Anonymously with Ptorx',
      minify: CONFIG.PROD,
      template: 'template.html'
    }),
    CONFIG.PROD ? new CompressionPlugin({ filename: '[path].gz' }) : null,
    CONFIG.PROD ? null : new webpack.HotModuleReplacementPlugin()
  ].filter(p => p !== null),

  devtool: 'inline-source-map',

  watchOptions: {
    aggregateTimeout: 500,
    ignored: ['node_modules', 'dist']
  },

  devServer: {
    historyApiFallback: true,
    /** @todo remove this eventually */
    disableHostCheck: true,
    contentBase: path.join(__dirname, 'dist'),
    port: CONFIG.PORT,
    hot: true
  }
};
