// 资源仓库本地路径
var webpack = require('webpack'),
    cleanWebpackPlugin = require("clean-webpack-plugin"),
    htmlWebpackPlugin = require('html-webpack-plugin'),
    extractTextWebpackPlugin = require('extract-text-webpack-plugin'),
    copyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
    entry: {
        // 入口文件
        "bootstrap": "./webapp/scripts/bootstrap",
    }, output: {
        // 输出文件
        path: __dirname + "/dist",
        filename: 'scripts/[name]-[chunkhash:6].js',
    }, plugins: [
        // 清理目录
        new cleanWebpackPlugin(["dist"]),
        new htmlWebpackPlugin({
            filename: "index.html",
            template: "node_modules/yueworld/webapp/index.html"/*, chunks: ["library", "bootstrap"]*/,
            favicon: 'node_modules/yueworld/webapp/styles/img/common/favicon.ico',
            minify: {
                removeComments: true, collapseWhitespace: true
            }
        }), new htmlWebpackPlugin({
            filename: "browser.err.html",
            template: "node_modules/yueworld/webapp/browser.err.html",
            chunks: [],
            favicon: 'node_modules/yueworld/webapp/styles/img/common/favicon.ico',
            minify: {
                removeComments: true, collapseWhitespace: true
            }
        }),
        new extractTextWebpackPlugin({filename: "styles/[name]-[contenthash:6].css", allChunks: true}),
        new copyWebpackPlugin([
            {from: "node_modules/yueworld/webapp/styles/img/logo", to: "styles/img/logo"}
        ])
    ], module: {
        rules: [
            // html处理
            {test: /\.html$/, loader: 'html-loader'},
            // css处理
            {
                test: /\.css$/,
                use: extractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    use: ["css-loader", "postcss-loader"],
                    publicPath: "../"
                })
            },
            // 图片处理
            {test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=1&name=styles/img/[name].[md5:hash:hex:7].[ext]'},// 8192
            {
                test: /\.(ttf|eot|svg|woff|woff2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=1&minetype=application/font-woff&name=styles/fonts/[name].[md5:hash:hex:7].[ext]"
            }
        ]
    }, devServer: {
        // web 服务
        host: "127.0.0.1", port: 8080,
        contentBase: './dist/', quiet: true/*静默*/, inline: true,
        proxy: {
            '/sdk/*':
                {
                    target: 'http://127.0.0.1:7070/basic_web/',
                    changeOrigin:true,
                    secure: false
                }
        }, historyApiFallback: {
            rewrites: [
                {from: /.+.html/, to: '/index.html'}
            ]
        }
    }
};