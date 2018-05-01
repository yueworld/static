module.exports = function ($app) {
    // ============================================== 平台 ===============================================
    [
        // 组织机构
        require("./organization"),
        // 用户
        require("./user"),
        // 附件
        require("./attachment"),
        // 留言、评论
        require("./comment")
    ].forEach(function (callback) {
        callback($app)
    });
}