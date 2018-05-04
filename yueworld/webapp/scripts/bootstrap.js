/**
 * bootstrap.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-03-02 10:32:11
 * @description Bootstrap App
 */

// 引入通用样式
require("./support/plugins/bootstrap/3.3.7.css");
require("./support/plugins/angular/1.6.0.csp.css");
require("./support/plugins/angular-ui-bootstrap/2.5.0.css");
require("./support/plugins/swiper/4.0.1/swiper.css");
require("../styles/css/animate.css");
require("../styles/css/bootstrap.css");
require("../styles/css/framework.css");

// 引入通用类库
var jQuery = window.__jq__ = require("./support/plugins/jquery.easing/1.4.1.js")(require("./support/plugins/jquery/3.1.1"));
jQuery("html").attr("ng-jq", "__jq__");

// require("./support/plugins/swiper/4.0.1/swiper.js");
require("./support/plugins/angular/1.6.0.js");
require("./support/plugins/angular-locale/zh");
require("./support/plugins/angular-animate/1.6.0.js");
require("./support/plugins/angular-sanitize/1.6.0.js");
require("./support/plugins/angular-bindonce/0.3.1.js");
require("./support/plugins/angular-ui-router/0.4.2.js");
require("./support/plugins/angular-ui-bootstrap/2.5.0.js");
require("./support/plugins/angular-swiper/angular-swiper.js");
require("./support/plugins/snap.svg/import.js");

/**
 * 导出 类库
 * @param config    配置信息
 * @param $app      Angular Module
 */

module.exports = function ($app) {
    // 配置
    $app.setup = angular.extend({
        // 标题
        title: "请稍候、系统正在努力加载中。",
        // Loading
        loading: false,
        // 开启 HTML5 URL 模式
        html5Mode: false,
        // 初始化
        init: angular.noop,
        // 启动完毕
        bootstrap: angular.noop,
        // 会话
        session: {
            code: 200,
            message: "已登录！",
            user: {username: "zhanggj", realname: "张高江"},
            settings: [
                {path: "/ui/logo", value: "styles/img/logo/default.png"},
                {path: "/ui/title/full", value: "测试系统"}
            ], dictionary: {
                AREA: [{name: "北部区域", id: "1001"}, {name: "南部区域", id: "1002"}],
                PROJECTS: [{name: "上海宝龙城市广场", id: "1001"}, {name: "上海宝龙城市广场", id: "1001"}],
            }
        },
        // 请求超时
        requestTimeout: function ($app) {
            $app.loading(false);
            $app.msgbox.error({
                message: "很抱歉！<br/>由于您的网络原因、请求失败。",
                buttons: [{text: "我要重试", result: true}]
            }).then(function () {
                $state.reload();
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
                $timeout(function () {
                    $animate.removeClass($app.el.loading, "in").then(function () {
                        $app.el.loading.hide();
                        $app.el.loading.addClass("complete");
                    })
                })
            } else {
                // 隐藏loading
                $app.loading(false);
            }
        }
    }, window.$app);
    window.$app = $app;

    // 绑定 jQuery
    $app.$ = jQuery;

    // 初始化
    $app.setup.init($app)

    // 绑定全局对象
    $app.run(["$rootScope", "$injector", "$state", function ($rootScope, $injector, $state) {
        // 绑定注入器
        $app.injector = $injector;
        // 绑定路由
        $app.router = {go: $state.go, is: $state.is, includes: $state.includes, reload: $state.reload};
        // 绑定全局作用域
        $rootScope.$app = $app
    }])
    // 通用 异常信息拦截
    $app.config(["$provide", "$stateProvider", "$urlRouterProvider", "$locationProvider", function ($provide, $stateProvider, $urlRouterProvider, $locationProvider) {
        $provide.decorator("$exceptionHandler", ["$delegate", function ($delegate) {
            return function (exception, cause) {
                $delegate(exception, cause);
                console.log(exception.message || cause);
            }
        }]);
        // 开启H5路由模式
        $locationProvider.html5Mode($app.setup.html5Mode);
    }]);

    // 启动初始化
    $app.run(["$rootScope", "$templateCache", "$state", "$stateParams", "$location", "$q", "$timeout", "$animate", "$injector", function ($rootScope, $templateCache, $state, $stateParams, $location, $q, $timeout, $animate, injector, isFirstRouterComplete) {

        // 每次路由开始时执行
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $app.setup.stateChangeStart($app, event, toState, toParams, fromState, fromParams);
        })

        // 每次路由成功时执行
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $app.setup.stateChangeSuccess($app, event, toState, toParams, fromState, fromParams);
        });

        // 请求超时
        $app.event.subscribe("requestTimeout", function () {
            $app.setup.requestTimeout($app);
        });

        // 响应异常
        $app.event.subscribe("responseError", function (event, message) {
            $app.setup.responseError($app, message)
        });

        // 未登陆
        $app.event.subscribe("needLogin", function (event, response) {
            $app.setup.needLogin($app, response)
        });

        if ($app.setup.session.code == 200) {
            // ======================================== 已登陆 ==========================================================
            // 调整 loading 遮罩级别
            $app.el.loading.css({zIndex: 910})
            // 移除 单点登陆 票据参数
            $location.search(angular.extend($location.search(), {_stk_: undefined}));
            // 设置用户信息
            $app.user = angular.extend($app.user, $app.setup.session.user, {login: true});
            // 远端配置
            $app.setting.init($app.setup.session.settings);
            // 数据字典
            $app.dictionary.init($app.setup.session.dictionary);
        } else if ($app.setup.session.code == -100) {
            // ======================================== 未登陆 ==========================================================
            $app.msgbox.error({
                title: false,
                message: "您尚未登陆、请先登陆！",
                buttons: [{text: "我要登陆", result: true}]
            }).then(function () {
                window.location.href = $app.setup.session.data.login.split("_srk_")[0] + "_srk_=" + encodeURIComponent(window.location.href);
            })
        } else if ($app.setup.session.code == 500) {
            // ======================================== 服务器错误 ======================================================
            $app.msgbox.error({
                message: "很抱歉！<br/>由于服务器内部错误、请求失败。",
                buttons: [{text: "我要重试", result: true}]
            }).then(function () {
                window.location.reload();
            })
        } else {
            $app.msgbox.error({message: $app.setup.session.message});
        }
        // 执行启动完成
        if ($app.setup.bootstrap) {
            $app.setup.bootstrap($app);
        }
    }]);

    // 导入工具函数
    require("./support/import")($app);

    // 导入基础模块
    require("./application/import")($app);

    return $app;
}