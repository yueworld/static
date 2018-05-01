module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    [
        // 公司信息
        require("./head"),
        // 项目
        require("./project")
    ].forEach(function (callback) {
        callback($app)
    });
}