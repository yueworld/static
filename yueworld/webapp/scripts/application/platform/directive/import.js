module.exports = function ($app) {
    // ============================================== Angular 指令扩展 ==================================================
    [
        // app 主入口
        require("./app"),
        require("./dropdown.static"),
        require("./dropdown.dynamic"),
        require("./dropdown.tree"),
        require("./dropdown.project"),
        require("./dropdown.space"),
        require("./list"),
        require("./tree"),
        // 功能型
        require("./icon"),
        require("./error"),
        require("./edit"),
        require("./enter"),
        require("./tip"),
        require("./drag"),
        require("./number"),
        require("./zoom"),
        require("./uploader")
    ].forEach(function (callback) {
        callback($app)
    });
}