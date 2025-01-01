var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var autoprefixer = require("autoprefixer");

var productionConfig = [
  {
    entry: "./assets/index",
    output: {
      filename: "index.bundle.js",
      path: path.resolve(__dirname, "public"),
    },
    module: {
      loaders: [
        {
          test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          loader: "file?name=fonts/[name].[ext]",
        },
        {
          test: /\.(png|jpg)$/,
          loader:
            "url?limit=8192&context=assets&name=[path][name]_[hash:12].[ext]",
        },
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract(
            "style",
            "css!postcss!resolve-url!sass?sourceMap"
          ),
        },
        {
          test: /\.js$/,
          loader: "babel",
          include: path.resolve(__dirname, "assets"),
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(["public"], {
        verbose: true,
        exclude: [".git"],
      }),
      new ExtractTextPlugin("index.css", {
        allChunks: true,
      }),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("production"),
        },
      }),
      new webpack.optimize.UglifyJsPlugin(),
      new HtmlWebpackPlugin({
        template: "./index.ejs",
      }),
      new CopyWebpackPlugin([
        { from: "vendor" },
        { from: "docs", to: "docs" },
        { from: "CNAME" },
        { from: "ie.html" },
        { from: "favicon.ico" },
      ]),
    ],
    postcss: [
      autoprefixer({
        browsers: [
          "Android >= 4.0",
          "iOS >= 7.0",
          "Chrome > 31",
          "ff > 31",
          "ie >= 10",
        ],
      }),
    ],
  },
];

module.exports = productionConfig;
