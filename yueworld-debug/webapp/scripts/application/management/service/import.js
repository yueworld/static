module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    [
        // 审批
        require("./workflow")
    ].forEach(function (callback) {
        callback($app)
    });
}