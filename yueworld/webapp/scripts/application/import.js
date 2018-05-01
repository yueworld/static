module.exports = function ($app) {
    // ====================================== 引入模块 ==================================================================
    [
        // 基础平台
        require("./platform/import")
    ].forEach(function (callback) {
        callback($app)
    });
}