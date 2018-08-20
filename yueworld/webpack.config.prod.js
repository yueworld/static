/**
 * 正式环境配置
 */
const merge = require('webpack-merge'),
    UglifyJsPlugin = require("uglifyjs-webpack-plugin"),
    OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = merge(require('./webpack.config.common'), {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(js|html)$/, loader: 'string-replace-loader',
                query: {
                    multiple: [
                        {
                            search: /<base href=\"\/\">/gm,
                            replace: '<base href=\'${urlHelper.getContextPath(\"/\")}\'/>', flags: 'ig'
                        }
                    ]
                }
            }
        ]
    }, optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                // sourceMap: true // set to true if you want JS source maps
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    safe: true
                }
            })
        ]
    }, output: {
        // 输出文件
        // path: __dirname + "/dist",
        path: "/data/workspace/zhongjiao/static/static/yueworld",
        // path:"/data/work/yueworld/yinli/amp/static/static/yueworld/library",
        filename: '[name].js'
    }
});