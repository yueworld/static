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
require("./support/plugins/animate/animate.css");
// require("./support/plugins/swiper/4.0.1/swiper.css");
require("../styles/css/variables.scss");
require("../styles/css/bootstrap.scss");
require("../styles/css/animation.scss");
require("../styles/css/platform.scss");

// 引入通用类库
var jQuery = window.__jq__ = require("./support/plugins/jquery/3.1.1");
jQuery("html").attr("ng-jq", "__jq__");
require("./support/plugins/jquery.easing/1.4.1.js")(jQuery);
// require("./support/plugins/swiper/4.0.1/swiper.js");
require("./support/plugins/angular/1.6.0.js");
require("./support/plugins/angular-locale/zh");
require("./support/plugins/angular-animate/1.6.0.js");
require("./support/plugins/angular-sanitize/1.6.0.js");
require("./support/plugins/angular-bindonce/0.3.1.js");
require("./support/plugins/angular-ui-router/0.4.2.js");
require("./support/plugins/angular-ui-bootstrap/2.5.0.js");
// require("./support/plugins/angular-swiper/angular-swiper.js");
require("./support/plugins/snap.svg/import.js");

/**
 * 导出 类库
 * @param config    配置信息
 * @param $app      Angular Module
 */
var $app = {
        $: jQuery /* 绑定 jQuery*/
    },
    app = angular.module("$app", ["ngLocale", "ngAnimate", "ngSanitize", "pasvaz.bindonce", "ui.bootstrap", "ui.router"]);

/**
 * 注册器
 * @type {{wrapDirective, wrapRouter, wrapService}}
 */
$app.register = require("./support/register")($app, app)

// 导入工具函数
require("./support/import")($app);
// 默认配置
require("./support/defaults")($app)

// 通用 异常信息拦截
$app.register.config(["$provide", "$stateProvider", "$urlRouterProvider", "$locationProvider", "$compileProvider", function ($provide, $stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {

    $compileProvider.debugInfoEnabled(false);

    $provide.decorator("$exceptionHandler", ["$delegate", function ($delegate) {
        return function (exception, cause) {
            // 调用默认行为
            $delegate(exception, cause);
            // 异常输出
            console.error(exception);
        }
    }]);

    // 注册默认 地址
    $urlRouterProvider.otherwise(function () {
        if ($app.session.login) {
            return $app.defaults.otherwise;
        }
    });

    // 开启H5路由模式
    $locationProvider.html5Mode($app.defaults.html5Mode);

}]);


// 启动初始化
$app.register.run(["$rootScope", "$location", "$q", "$timeout", "$animate", function ($rootScope, $location, $q, $timeout, $animate, isFirstRouterComplete) {
    try {
        // 绑定全局作用域
        $rootScope.$app = $app

        // 每次路由开始时执行
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $app.defaults.stateChangeStart($app, event, toState, toParams, fromState, fromParams);
        })

        // 每次路由成功时执行
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $app.defaults.stateChangeSuccess($app, event, toState, toParams, fromState, fromParams);
        });

        // 增加 Class
        $app.addClass = function (el, className) {
            return $timeout(function () {
                return $animate.addClass(el, className);
            })
        }

        // 增加 Class
        $app.removeClass = function (el, className) {
            return $timeout(function () {
                return $animate.removeClass(el, className);
            })
        }

        // 请求超时
        $app.event.subscribe("requestTimeout", function () {
            $app.defaults.requestTimeout($app);
        });

        // 响应异常
        $app.event.subscribe("responseError", function (event, message) {
            $app.defaults.responseError($app, message)
        });

        // 未登陆
        $app.event.subscribe("needLogin", function (event, response) {
            $app.defaults.needLogin($app, response)
        });

        // ============================================================================================================
        // 初始化 Title
        $app.el.title.text($app.defaults.title || $app.defaults._title);

        // 会话
        if ($app.defaults.session.code == 200) {
            // ======================================== 已登陆 ==========================================================
            // 调整 loading 遮罩级别
            $app.el.loading.css({zIndex: 2002})
            // 移除 单点登陆 票据参数
            $location.search(angular.extend($location.search(), {_stk_: undefined}));
            // 设置会话信息
            $app.session = angular.extend($app.session, $app.defaults.session.data.user, {login: true});
            // 远端配置
            $app.config.init($app.defaults.session.data.configs);
            // 数据字典
            $app.dictionary.init($app.defaults.session.data.dictionary);
        } else if ($app.defaults.session.code == -100) {
            // ======================================== 未登陆 ==========================================================
            $app.msgbox.error({
                title: false,
                message: "您尚未登陆、请先登陆！",
                buttons: [{text: "我要登陆", result: true}]
            }).then(function () {
                window.location.href = $app.defaults.session.data.login.split("_srk_")[0] + "_srk_=" + encodeURIComponent(window.location.href);
            })
        } else if ($app.defaults.session.code == 500) {
            // ======================================== 服务器错误 ======================================================
            $app.msgbox.error({
                message: "很抱歉！<br/>由于服务器内部错误、请求失败。",
                buttons: [{text: "我要重试", result: true}]
            }).then(function () {
                window.location.reload();
            })
        } else {
            $app.msgbox.error({message: $app.defaults.session.message});
        }

        // 执行启动完成
        $app.defaults.ready($app);

    } catch (ex) {
        console.log(ex)
    }

}]);

/**
 * 初始动作
 */
function init($app) {
    // 初始化 Title
    // 暂存自定义标题
    $app.el.title.text($app.defaults._title);
    if ($app.defaults.container) {
        $app.el.container = $app.$($app.defaults.container);
    }
    if ($app.el.loading.length == 0) {
        $app.el.loading = $app.$(require("./application/platform/views/loading.html")).appendTo($app.el.container);
    }
    // Svg Icon
    $app.el.container.prepend("<div ng-include=\"'scripts/application/platform/views/icons.html'\"></div>");
    // 默认显示、隐藏 Loading
    $app.el.loading.css({display: $app.defaults.loading ? "block" : "none"});

}

/**
 * 启动 Angular Js
 * @param option
 */
$app.bootstrap = function (option, imports) {
    // 配置信息
    var defaults = $app.defaults = angular.extend($app.defaults, option);
    // 引入子系统
    angular.forEach(defaults.imports.concat(imports), function (childSystem) {
        childSystem && childSystem($app);
    });

    // 初始动作
    init($app)

    if (defaults.sessionUrl) {
        // 获取会话
        var _stk_ = $app.url.getParams("_stk_");
        $app.$.getJSON($app.url.getDynamicUrl(defaults.sessionUrl), _stk_ ? {_stk_: _stk_} : {}).then(function ($response) {
            $app.defaults = angular.extend(defaults, {session: $response});
        }).fail(function () {
            $app.defaults = angular.extend(defaults, {session: {success: false, code: 500}});
        }).always(function () {
            angular.bootstrap($app.el.container.is("body") ? document : $app.el.container.get(0), ["$app"]);
        });
    } else {
        angular.bootstrap($app.el.container.is("body") ? document : $app.el.container.get(0), ["$app"]);
    }
    return $app;
}
module.exports = $app;