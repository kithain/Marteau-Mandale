const path = require('path');

module.exports = {
  entry: {
    main: './app/static/js/html_java_jeu.js',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app/static/dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};
