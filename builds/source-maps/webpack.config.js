const path = require('path');
const sourceMapConfig = require('./source-map-config.json');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    sourceMapFilename: '[name].js.map',
    publicPath: sourceMapConfig.hosting.local.url + '/'
  },
  devtool: 'source-map', // Generiert separate .map Dateien
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            sourceMaps: true
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  // Source Maps werden automatisch in dist/ erstellt
  // Kommentar wird automatisch hinzugefügt: //# sourceMappingURL=bundle.js.map
};

