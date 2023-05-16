const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const glob = require('glob')

module.exports = {
    entry: path.resolve(__dirname, '../src/script.js'),
    output:
    {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins:
    [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') },
                { from: 'src/models', to: 'models' },
                { from: 'src/textures', to: 'textures' },
            ]
        }),
        ...glob.sync('./src/*.html').map((fileName) => new HtmlWebpackPlugin({
            template: fileName,
            filename: path.basename(fileName),
            minify: true
        })),
        new MiniCSSExtractPlugin()
    ],
    module:
    {
        rules:
        [
            // HTML
            {
                test: /\.(html)$/,
                use: ['html-loader']
            },

            // JS
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:
                [
                    'babel-loader'
                ]
            },

            // CSS
            {
                test: /\.css$/,
                use:
                [
                    MiniCSSExtractPlugin.loader,
                    'css-loader'
                ]
            },
         
              // SCSS
             {
                test: /\.scss$/,
                use: [
                  MiniCSSExtractPlugin.loader,
                  'css-loader',
                  'sass-loader'
                ]
            },
           // Images
           {
               test: /\.(jpg|png|gif|svg)$/,
               use: [
                   {
                       loader: 'url-loader',
                       options: {
                           limit: 8192, // Images smaller than 8KB will be transformed into base64 and inlined
                           outputPath: 'img/',
                           name: '[name].[hash].[ext]',
                       },
                   },
               ],
           },

            // Fonts
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                use:
                [
                    {
                        loader: 'file-loader',
                        options:
                        {
                            outputPath: 'assets/fonts/'
                        }
                    }
                ]
            }
        ]
    }
}