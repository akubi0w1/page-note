const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    "content/content": ['@babel/polyfill', './src/content/contentScript.js'],
    "popup/popup": './src/popup/popup.js',
    "background/background": ['@babel/polyfill' , './src/background/background.js'],
    "editnote/editnote": ['@babel/polyfill', './src/editnote/editnote.js'],
    "notelist/notelist": './src/notelist/notelist.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
              ],
            },
          },
        ],
      },
    ],
  },
};