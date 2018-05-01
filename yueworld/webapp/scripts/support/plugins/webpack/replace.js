// 自定义 ReplaceWebpackPlugin 插件
function HtmlReplaceWebpackPlugin(options) {
    this.options = options || [];
}
HtmlReplaceWebpackPlugin.prototype.apply = function (compiler) {
    var self = this;
    compiler.plugin('compilation', function (compilation) {
        compilation.plugin('html-webpack-plugin-after-html-processing', function (htmlPluginData, callback) {
            self.options.forEach(function (option) {
                htmlPluginData.html = htmlPluginData.html.replace(option.search, option.replace);
            })
            callback(null, htmlPluginData);
        });
    });
};
module.exports = HtmlReplaceWebpackPlugin;