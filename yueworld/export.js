/**
 * 导出 yueworld.js 为独立 可运行文件
 *   min.js
 *   min.css
 *   styles/*.*
 */
// =========================================================

(function ($app) {
    // 启动 Angular Js;
    angular.bootstrap(document, ["$app"]);
    return window.$app = $app;
})(require("./index")(angular.module("$app", ["ngLocale", "ngAnimate", "ngSanitize", "pasvaz.bindonce", "ui.bootstrap", "ui.router"])));




