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
        body: $app.$("body"),
        loading: $app.$('div.ys-framework-loading')
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
        // 统一 Request 封装
        require("./request"),
        // Loading
        require("./loading"),
        // 遮罩、背景
        require("./backdrop"),
        // 其他
        require("./helper")
    ].forEach(function (callback) {
        callback($app)
    });
};