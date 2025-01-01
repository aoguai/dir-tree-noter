const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const OpenBrowserPlugin = require("open-browser-webpack-plugin");
const autoprefixer = require("autoprefixer");

const publicPath = "http://localhost:8000/";

module.exports = {
  entry: [
    "webpack-dev-server/client?" + publicPath,
    "webpack/hot/only-dev-server",
    "./assets/index",
  ],
  devtool: "eval-source-map",
  output: {
    filename: "index.bundle.js",
    path: path.resolve(__dirname, "public"),
    publicPath: publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: {
          loader: "file-loader",
          options: {
            name: "fonts/[name].[ext]",
          },
        },
      },
      {
        test: /\.(png|jpg)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 8192,
            context: "assets",
            name: "[path][name].[ext]",
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [
                  autoprefixer({
                    overrideBrowserslist: [
                      "Android >= 4.0",
                      "iOS >= 7.0",
                      "Chrome > 31",
                      "ff > 31",
                      "ie >= 10",
                    ],
                  }),
                ],
              },
            },
          },
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: ["react-hot-loader/webpack", "babel-loader"],
        include: path.resolve(__dirname, "assets"),
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.ejs",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "vendor" }],
    }),
    new OpenBrowserPlugin({
      url: publicPath,
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    hot: true,
    port: 8000,
    contentBase: path.join(__dirname, "public"),
  },
};
