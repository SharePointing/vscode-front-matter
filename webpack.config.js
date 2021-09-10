//@ts-check

'use strict';

const path = require('path');

const config = [
  {
    name: 'extension',
    target: 'node',
    entry: './src/extension.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'source-map',
    externals: {
      vscode: 'commonjs vscode'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [{
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{
          loader: 'ts-loader'
        }]
      }]
    },
    performance: {
      maxEntrypointSize: 400000,
      maxAssetSize: 400000
    }
  },
  {
    name: 'viewpanel',
    target: 'web',
    entry: './src/viewpanel/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'viewpanel.js'
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [{
            loader: 'ts-loader'
          }]
        }
      ]
    },
    performance: {
      maxEntrypointSize: 400000,
      maxAssetSize: 400000
    }
  },
  {
    name: 'pagesView',
    target: 'web',
    entry: './src/pagesView/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'pages.js'
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [{
            loader: 'ts-loader'
          }]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        }
      ]
    },
    performance: {
      maxEntrypointSize: 400000,
      maxAssetSize: 400000
    }
  }
];

module.exports = (env, argv) => {
  for (const configItem of config) {
    configItem.mode = argv.mode;
  }

  return config;
};