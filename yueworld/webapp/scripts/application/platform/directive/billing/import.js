module.exports = function ($app) {
    // ============================================== Angular 指令扩展 ==================================================
    [
        require("./plan"),
        require("./plan.rule"),
        require("./plan.rule.cycle"),
    ].forEach(function (callback) {
        callback($app)
    });
}