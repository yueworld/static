/**
 * bootstrap.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-03-02 10:32:11
 * @description Bootstrap App
 */
// 初始化
(function ($app) {
    $app.register.config(["$urlRouterProvider", function ($urlRouterProvider) {
        // 注册默认跳转页面
        $urlRouterProvider.otherwise(function () {
            if ($app.user.login) {
                return "/basic/info/head/index.html";
            }
        })
    }]);
    // 基础数据
    require("./application/basic/import")($app);
    // 基础数据
    require("./application/management/import")($app);
    // 模拟用户登录
    $app.value("$session", {
        success: true, code: 200,
        data: {
            user: {username: "zhanggj", realname: "张高江"},
            settings: [
                {path: "/ui/logo", value: "styles/img/logo/default.png"},
                {path: "/ui/title/full", value: "测试系统"}
            ], dictionary: {
                LAYOUTS: [{name: "全部业态", id: "-1", level: 0}],
                APPROVAL_STATUS: [{text: "测试", id: 123}]
            }
        }
    });
    angular.bootstrap(document, ["$app"]);
})(window.$app = require("../../../yueworld/index")(angular.module("$app", ["ngLocale", "ngAnimate", "ngSanitize", "pasvaz.bindonce", "ui.bootstrap", "ui.router"])));