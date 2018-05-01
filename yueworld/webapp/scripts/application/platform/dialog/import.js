module.exports = function ($app) {
    // ============================================== 管理后台 ===============================================
    [
        // 组织机构
        require("./organization"),
        // 用户
        require("./user"),
        // 附件
        require("./attachment"),
        // 评论
        require("./comment"),
        // 选择
        require("./select"),
        // 图片缩放
        require("./zoom")
    ].forEach(function (callback) {
        callback($app)
    });
}