require('dotenv').config();
require('enve');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const PROD = process.enve.NODE_ENV == 'production';

module.exports = {
  mode: process.enve.NODE_ENV,

  entry: './lib/index.ts',

  output: {
    publicPath: '/static/',
    filename: '[name].[hash].js',
    pathinfo: false,
    path: path.resolve(__dirname, 'dist')
  },

  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    },
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
          plugins: ['@babel/plugin-proposal-class-properties']
        }
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(png|jpg|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/static',
              name: '[name].[hash].[ext]'
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.enve.NODE_ENV),
      'process.enve': Object.entries(process.enve).reduce((o, [k, v]) => {
        o[k] = JSON.stringify(v);
        return o;
      }, {})
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      minify: PROD,
      template: 'template.html',
      templateParameters: {
        YALCS_WEB_URL: process.enve.YALCS_WEB_URL,
        TITLE: 'Email Forwarding and Aliases by Ptorx'
      }
    }),
    PROD ? new CompressionPlugin({ filename: '[path].gz' }) : null,
    PROD ? null : new webpack.HotModuleReplacementPlugin()
  ].filter(p => p !== null),

  devtool: PROD ? false : 'inline-source-map',

  devServer: {
    historyApiFallback: true,
    /** @todo remove this eventually */
    disableHostCheck: true,
    contentBase: path.join(__dirname, 'dist'),
    writeToDisk: true,
    port: process.enve.PORT,
    // host: '0.0.0.0',
    hot: true
  },

  watchOptions: {
    aggregateTimeout: 500,
    ignored: ['node_modules', 'dist']
  }
};
