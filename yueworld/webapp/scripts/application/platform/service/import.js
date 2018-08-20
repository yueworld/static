module.exports = function ($app) {
    // ============================================== 平台 ===============================================
    [
        // 统一 Request 封装
        require("./request"),
        // 附件
        require("./file"),
        // 组织机构
        require("./organization"),
        // 用户
        require("./user"),
        // 留言、评论
        require("./comment")
    ].forEach(function (callback) {
        callback($app)
    });
}