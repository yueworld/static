module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    [
        // 项目
        require("./workflow")
    ].forEach(function (callback) {
        callback($app)
    });
}