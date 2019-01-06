const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const config = require('../server/config');
const path = require('path');

const PROD = config.environment.type == 'production';

module.exports = {
  mode: config.environment.type,

  entry: {
    Affiliate: './components/Affiliate.jsx',
    Info: './components/Info.jsx',
    App: './components/App.jsx'
  },

  output: {
    publicPath: '/static/js/',
    filename: PROD ? '[name].[hash].js' : '[name].js',
    path: path.resolve(__dirname, 'dist/js')
  },

  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
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
          ]
        }
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(config.environment.type)
      }
    }),
    PROD ? new CompressionPlugin({ filename: '[path].gz' }) : null
  ].filter(p => p !== null)
};
