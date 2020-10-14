const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    "content/content": './src/content/contentScript.js',
    "popup/popup": './src/popup/popup.js',
    "background/background": './src/background/background.js',
    "editnote/editnote": './src/editnote/editnote.js',
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