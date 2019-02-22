const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackAutoInject = require('webpack-auto-inject-version');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app_bundle: "./src/main.js",
        print_bundle: "./src/print/print.js"
    },
    module: {
        rules: [{
            test: /\.woff$/,
            use: {
                loader: "url-loader",
                options: {
                    limit: 50000,
                },
            },
        },{
             test: /\.css$/,
             use: ["style-loader", "css-loader"]
        }, {
            test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
            loader: 'url-loader?limit=100000'
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            "window.$": "jquery"
        }),
        new WebpackAutoInject({
            components: {
                AutoIncreaseVersion: false
            }
        }),
        new CopyWebpackPlugin([
            { from: "./src/midi.html" },
            { from: "./src/print/preset-template.html", to: "templates"},
            { from: "./src/css/midi.css", to: "css" },
            { from: "./src/img/favicon-16x16.png" },
            { from: "./src/img/favicon-32x32.png" },
            { from: "./src/img/favicon-96x96.png" }
        ]),
        new HtmlWebpackPlugin({
            chunks: ["app_bundle"],
            hash: true,
            inject: 'head',
            template: './src/index.html',
            filename: './index.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            chunks: ["print_bundle"],
            hash: true,
            inject: 'head',
            template: './src/print/print.html',
            filename: './print.html' //relative to root of the application
        })
    ],
    performance: {
        maxAssetSize: 1000000,
        maxEntrypointSize: 1000000
    }
};
