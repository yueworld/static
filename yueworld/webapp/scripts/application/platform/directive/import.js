module.exports = function ($app) {
    // ============================================== Angular 指令扩展 ==================================================
    [
        // app 主入口
        require("./app"),
        // 下拉框
        require("./dropdown.static"),
        require("./dropdown.dynamic"),
        require("./dropdown.tree"),
        require("./dropdown.project"),
        require("./dropdown.space"),
        require("./form.table"),
        require("./input"),
        require("./list"),
        // 功能型
        require("./icon"),
        require("./error"),
        require("./edit"),
        require("./enter"),
        require("./tip"),
        require("./drag"),
        require("./number"),
        require("./zoom"),
        require("./tree"),
        require("./uploader"),
    ].forEach(function (callback) {
        callback($app)
    });
}