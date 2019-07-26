const webpack = require("webpack");

module.exports = {
    mode: "production",
    entry: "./index.js",
    target: "node",
    output: {
        path: `${process.cwd()}/dist`,
        filename: "index.js",
        library: "index",
        libraryTarget: "commonjs2"
    },
    externals: {
        "aws-sdk": "aws-sdk"
    }
};
