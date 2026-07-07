const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    mode: 'production',
    devtool: 'inline-source-map',
    output: {
        filename: 'app.js',
        path: path.join(__dirname, 'dist'),
        publicPath: './',
        clean: true,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(woff(2)?|ttf|eot)$/,
                type: 'asset/resource',
                generator: {
                    filename: './fonts/[name][ext]',
                },
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
            inject: "body"
        }),
        new CopyPlugin({
            patterns: [
                {from: "./src/static/fonts", to: "fonts"},
                {from: "./src/templates", to: "templates"},
                {from: "./src/static/images", to: "images"},
                {from: "./src/static/favicon", to: "favicon"},
                {from: "./src/styles/sidebars.css", to: "css"},
                {from: "./node_modules/admin-lte/plugins/fontawesome-free/webfonts", to: "webfonts"},
                {from: "./node_modules/admin-lte/plugins/fontawesome-free/css/all.min.css", to: "css"},
                {from: "./node_modules/admin-lte/dist/css/adminlte.min.css", to: "css"},
                {from: "./node_modules/admin-lte/dist/js/adminlte.min.js", to: "js"},
                {from: "./node_modules/admin-lte/plugins/jquery/jquery.min.js", to: "js"},
                {from: "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "js"},
                {from: "./node_modules/bootstrap/dist/css/bootstrap.min.css", to: "css"},
                {from: "./node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff", to: "css/fonts"},
                {from: "./node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2", to: "css/fonts"},
                {from: "./node_modules/bootstrap-icons/font/bootstrap-icons.min.css", to: "css"},
                {from: "./node_modules/chart.js/dist/chart.js", to: "js"},
                {from: "./node_modules/chart.js/dist/chart.umd.js", to: "js"},
                {from: "./src/config/docker-compose.yml", to: ""},
                {from: "./src/config/default.conf", to: "nginx_conf"},
                {from: "./src/static/_redirects", to: ""},
            ],
        }),
        new Dotenv(),
    ],
    optimization: {
        minimizer: [new TerserPlugin({ extractComments: false })],
    },
};