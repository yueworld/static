/**
 * 开发环境配置
 */
const merge = require('webpack-merge');

module.exports = merge(require('./webpack.config.common'), {
    mode: 'development',
    devServer: {
        // web 服务
        host: "192.168.120.129", port: 1024,
        contentBase: './dist/', quiet: false /* 静默 */, inline: true,
        proxy: {
            '/sdk/*':
                {
                    target: 'http://127.0.0.1:9090/demo/',
                    changeOrigin: true,
                    secure: false
                }
        }, historyApiFallback: {
            rewrites: [
                {from: /.+.html/, to: '/index.html'}
            ]
        }
    }

});