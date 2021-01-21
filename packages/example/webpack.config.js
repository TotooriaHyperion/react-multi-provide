const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  resolve: {
    mainFields: ["main"],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    symlinks: false,
  },
  entry: path.resolve(__dirname, "./src/index.tsx"),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "./tsconfig.json"),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HTMLPlugin({
      template: path.resolve(__dirname, "./assets/index.html"),
    }),
  ],
};
