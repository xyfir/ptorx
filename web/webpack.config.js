const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const config = require('./constants/config');
const path = require('path');

const PROD = config.ENVIRONMENT == 'production';

module.exports = {
  mode: config.ENVIRONMENT,

  entry: {
    Affiliate: './components/Affiliate.tsx',
    Info: './components/Info.tsx',
    App: './components/App.tsx'
  },

  output: {
    publicPath: '/static/js/',
    filename: PROD ? '[name].[hash].js' : '[name].js',
    pathinfo: false,
    path: path.resolve(__dirname, 'dist/js')
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
          path.resolve(__dirname, 'actions'),
          path.resolve(__dirname, 'components'),
          path.resolve(__dirname, 'constants'),
          path.resolve(__dirname, 'lib'),
          path.resolve(__dirname, 'reducers')
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
                    'last 2 Firefox versions',
                    'last 2 iOS versions',
                    'last 2 Android versions'
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
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(config.ENVIRONMENT)
      }
    }),
    PROD ? new CompressionPlugin({ filename: '[path].gz' }) : null,
    PROD ? null : new webpack.HotModuleReplacementPlugin()
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
    port: 20070,
    hot: true
  }
};
