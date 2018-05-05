/**
 * 构造配置参数
 * @param $config
 * @param $bootstrap
 * @returns {Object}
 */
var isFirstRouterComplete = false;
module.exports = function ($app) {
    return {
        // 获取会话地址
        sessionUrl: undefined,// "sdk/platform/init",
        // 默认跳转地址
        indexURL: "/index.html",
        // 异步请求地址
        dynamicUrl: $app.$("base").attr("href") || "/",
        // 静态请求地址
        staticUrl: "http://static.yeuworld.cn/",
        // 标题
        title: "请稍候、系统正在努力加载中。",
        // Loading
        loading: false,
        // 开启 HTML5 URL 模式
        html5Mode: false,
        // 导入子系统
        imports: [require("../application/platform/import")],
        // 会话
        session: {
            code: 200,
            message: "已登录！",
            data: {
                user: {username: "zhanggj", realname: "张高江"},
                settings: [
                    {path: "/ui/logo", value: "styles/img/logo/default.png"},
                    {path: "/ui/title/full", value: "测试系统"}
                ], dictionary: {
                    AREA: [{name: "北部区域", id: "1001"}, {name: "南部区域", id: "1002"}],
                    PROJECTS: [{name: "上海宝龙城市广场", id: "1001"}, {name: "上海宝龙城市广场", id: "1001"}],
                }
            }
        },
        // 准备完毕
        ready: angular.noop,
        // 请求超时
        requestTimeout: function ($app) {
            $app.loading(false);
            $app.msgbox.error({
                message: "很抱歉！<br/>由于您的网络原因、请求失败。",
                buttons: [{text: "我要重试", result: true}]
            }).then(function () {
                $app.router.reload();
            })
        },
        // 响应异常
        responseError: function ($app, message /* 错误内容 */) {
            $app.loading(false);
            $app.msgbox.error({
                message: "很抱歉！<br/>由于服务器内部错误、请求失败。",
                buttons: [{text: "我要重试", result: true}]
            }).then(function () {
                window.location.reload();
            })
        },
        // 未登录或超时
        needLogin: function ($app, response) {
            $app.loading(false);
            $app.msgbox.error({
                message: "很抱歉！<br/>" + ($app.user.login ? "会话超时、请重新登陆！" : "您尚未登陆、请先去登陆！"),
                buttons: [{text: "去登陆", result: true}]
            }).then(function () {
                window.location.href = response.data.login.split("_srk_")[0] + "_srk_=" + encodeURIComponent(window.location.href);
            })
        },
        // 切换页面开始
        stateChangeStart: function ($app, event, toState, toParams, fromState, fromParams) {
            // 未登陆前禁止路由执行
            if (!$app.user.login) {
                event.preventDefault()
            } else {
                // 显示loading
                $app.loading(true);
            }
            $app.router.params = toParams;
        },
        // 切换页面成功
        stateChangeSuccess: function (event, toState, toParams, fromState, fromParams) {
            // 首次路由完成、隐藏 预加载框
            if (!isFirstRouterComplete) {
                isFirstRouterComplete = true;
                $app.removeClass($app.el.loading, "in").then(function () {
                    $app.el.loading.hide();
                    $app.el.loading.addClass("complete");
                })
            } else {
                // 隐藏loading
                $app.loading(false);
            }
        },
        // Extend Angular Module
        eam: []
    }
};