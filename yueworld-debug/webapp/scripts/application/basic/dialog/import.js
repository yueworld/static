module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    [
        // 项目
        require("./project"),
        // 业态
        require("./layout"),
    ].forEach(function (callback) {
        callback($app)
    });
}