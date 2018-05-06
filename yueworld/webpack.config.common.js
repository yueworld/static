// 资源仓库本地路径
const HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        // 入口文件
        "min": "./export.js",
    }, plugins: [
        // 清理目录
        new CleanWebpackPlugin(['dist', "npm-debug.log"]),
        new MiniCssExtractPlugin({
            filename: "[name].css", allChunks: true
        })
    ], module: {
        rules: [
            { // css 装载
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader, {
                        loader: 'css-loader'
                    }, "sass-loader", {
                        loader: "postcss-loader",
                        options: {
                            plugins: [require('autoprefixer')({/*add: true,browsers: []*/})]
                        }
                    }]
            },
            { // html 装载
                test: /\.html$/, loader: 'html-loader'
            }, { // 图片处理
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=1&name=styles/img/[name].[md5:hash:hex:7].[ext]'
            }, { // URL 装载
                test: /\.(ttf|eot|svg|woff|woff2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader",
                options: {
                    limit: 8192,
                    minetype: "application/font-woff",
                    name: "styles/fonts/[name].[md5:hash:hex:7].[ext]",
                }
            }
        ]
    }, output: {
        // 输出文件
        // path: __dirname + "/dist",
        path:"/data/work/yueworld/zhongjiao/static/static/yueworld",
        filename: '[name].js'
    }
};