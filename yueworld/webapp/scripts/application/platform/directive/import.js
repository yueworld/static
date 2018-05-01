module.exports = function ($app) {
    // ============================================== 基础数据 ===============================================
    [
        require("./main.framework"),
        require("./icon"),
        require("./toggle.panel"),
        // require("./select2"),
        // require("./tinymce"),
        require("./error"),
        require("./tree"),
        require("./uploader"),
        require("./select"),
        require("./dropdown"),
        require("./dropdown.tree"),
        require("./edit"),
        require("./number"),
        require("./tip"),
        require("./keyboard"),
    ].forEach(function (callback) {
        callback($app)
    });
}