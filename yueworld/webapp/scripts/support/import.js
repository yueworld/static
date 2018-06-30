module.exports = function ($app) {

    /**
     * 定义全局常用属性
     */
    var userAgent = navigator.userAgent.toLowerCase(),
        platform = navigator.platform.toLowerCase()
    // browser 浏览器版本
    $app.browser = {
        mozilla: /firefox/.test(userAgent),
        webkit: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        msie: /msie/.test(userAgent)
    };
    $app.platform = {
        window: platform.indexOf("win") != -1
    }
    $app.window = $app.$(window);
    $app.el = {
        document: $app.$(document),
        html: $app.$("html"),
        title: $app.$("html head title"),
        body: $app.$("html body"),
        container: $app.$("html body"),
        loading: $app.$("html body div.ys-platform-loading"),
    };
    [
        // 原生对象扩展
        require("./extend"),
        // 屏幕
        require("./screen"),
        // 缓存
        require("./cache"),
        // 校验
        require("./valid"),
        // 断言
        require("./assert"),
        // 事件
        require("./event"),
        // 日期
        require("./date"),
        // 数字
        require("./number"),
        // Url
        require("./url"),
        // Cookie
        require("./cookie"),
        // 结构化配置
        require("./setting"),
        // 数据字典
        require("./dictionary"),
        // Loading
        require("./loading"),
        // Tip
        require("./tip"),
        // 模态弹窗
        require("./modal"),
        // 对话框
        require("./msgbox"),
        // 表单
        require("./form"),
        // Loading
        require("./loading"),
        // 遮罩、背景
        require("./backdrop"),
        // JSON
        require("./json"),
        // Session
        require("./session"),
        // 其他
        require("./helper")
    ].forEach(function (callback) {
        callback($app)
    });
};