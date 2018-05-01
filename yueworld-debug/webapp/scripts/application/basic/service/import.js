module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    [
        // 项目
        require("./project"),
        // 合同抬头
        require("./head"),
        // 业态
        require("./layout"),
        // 业态
        require("./brand")
    ].forEach(function (callback) {
        callback($app)
    });
}