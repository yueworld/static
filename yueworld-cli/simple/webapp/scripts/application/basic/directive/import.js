module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    [
        // 项目管理
        require("./project")
    ].forEach(function (callback) {
        callback($app)
    });
}