module.exports = function ($app) {
    [
        // Helper 函数
        require("./helper"),
        // Loading
        require("./loading"),
        // 结构化配置
        require("./setting"),
        // 数据字典
        require("./dictionary"),
        // Tip
        require("./tips"),
        // 对话框
        require("./dialog"),
        // 统一 Request 封装
        require("./request")
    ].forEach(function (callback) {
        callback($app)
    })
};