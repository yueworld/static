module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    // 服务
    require("./service/import")($app);
    // 对话框
    require("./dialog/import")($app);
    // 路由
    require("./router/import")($app);
}
