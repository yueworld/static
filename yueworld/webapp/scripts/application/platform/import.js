module.exports = function ($app) {
    // ============================================== 管理后台 ===============================================
    // 服务
    require("./service/import")($app);
    // 对话框
    require("./dialog/import")($app);
    // 指令
    require("./directive/import")($app);
}
