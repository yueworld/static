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
    app = angular.module("$app", ["ngLocale", "ngAnimate", "ngSanitize", "pasvaz.bindonce", "ui.bootstrap", "ui.router"]),
    $controller = require("./support/controller"),
    register = require("./support/register");

/**
 * 代理 AngularJs 核心方法
 */
$app.config = app.config;
$app.factory = app.factory;
$app.directive = app.directive;
$app.constant = app.constant;
$app.run = app.run;
$app.controller = register.wrapController(app);
$app.router = register.wrapRouter(app);
$app.service = register.wrapService($app, app);

// 导入工具函数
require("./support/import")($app);
// 默认配置
require("./support/defaults")($app)

// 通用 异常信息拦截
$app.config(["$provide", "$stateProvider", "$urlRouterProvider", "$locationProvider", "$qProvider", function ($provide, $stateProvider, $urlRouterProvider, $locationProvider, $qProvider) {

    $provide.decorator("$exceptionHandler", ["$delegate", function ($delegate) {
        return function (exception, cause) {
            // 调用默认行为
            $delegate(exception, cause);
            // 异常输出
            console.log(exception);
        }
    }]);

    // 注册默认 地址
    $urlRouterProvider.otherwise(function () {
        if ($app.user.login) {
            return $app.setup.otherwise;
        }
    });

    // 开启H5路由模式
    $locationProvider.html5Mode($app.setup.html5Mode);

}]);


// 启动初始化
$app.run(["$rootScope", "$templateCache", "$state", "$stateParams", "$location", "$q", "$timeout", "$animate", "$injector", function ($rootScope, $templateCache, $state, $stateParams, $location, $q, $timeout, $animate, $injector, isFirstRouterComplete) {
    try {
        // 绑定全局作用域
        $rootScope.$app = $app

        // 每次路由开始时执行
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $app.setup.stateChangeStart($app, event, toState, toParams, fromState, fromParams);
        })

        // 每次路由成功时执行
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $app.setup.stateChangeSuccess($app, event, toState, toParams, fromState, fromParams);
        });

        // 绑定注入器
        $app.injector = $injector;

        // 绑定路由
        $app.router = {go: $state.go, is: $state.is, includes: $state.includes, reload: $state.reload};

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

        // ============================================================================================================
        // 初始化 Title
        $app.el.title.text($app.setup.title || $app.setup._title);

        // 会话
        if ($app.setup.session.code == 200) {
            // ======================================== 已登陆 ==========================================================
            // 调整 loading 遮罩级别
            $app.el.loading.css({zIndex: 2002})
            // 移除 单点登陆 票据参数
            $location.search(angular.extend($location.search(), {_stk_: undefined}));
            // 设置用户信息
            $app.user = angular.extend($app.user, $app.setup.session.data.user, {login: true});
            // 远端配置
            $app.setting.init($app.setup.session.data.settings);
            // 数据字典
            $app.dictionary.init($app.setup.session.data.dictionary);
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
        $app.setup.ready($app);

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
    $app.el.title.text($app.setup._title);
    if ($app.setup.container) {
        $app.el.container = $app.$($app.setup.container);
    }
    if ($app.el.loading.length == 0) {
        $app.el.loading = $app.$(require("./application/platform/views/loading.html")).appendTo($app.el.container);
    }
    // Svg Icon
    $app.el.container.prepend("<div ng-include=\"'scripts/application/platform/views/icons.html'\"></div>");
    // 默认显示、隐藏 Loading
    $app.el.loading.css({display: $app.setup.loading ? "block" : "none"});
}

/**
 * 启动 Angular Js
 * @param option
 */
$app.bootstrap = function (option, imports) {
    // 配置信息
    var setup = $app.setup = angular.extend($app.setup, option);

    // 引入子系统
    angular.forEach(setup.imports.concat(imports), function (childSystem) {
        childSystem && childSystem($app);
    });

    // 初始动作
    init($app)

    if (setup.sessionUrl) {
        // 获取会话
        var _stk_ = $app.url.getParams("_stk_");
        $app.$.getJSON($app.url.getDynamicUrl(setup.sessionUrl), _stk_ ? {_stk_: _stk_} : {}).then(function ($response) {
            $app.setup = angular.extend(setup, {session: $response});
        }).fail(function () {
            $app.setup = angular.extend(setup, {session: {success: false, code: 500}});
        }).always(function () {
            angular.bootstrap($app.el.container.is("body") ? document : $app.el.container.get(0), ["$app"]);
        });
    } else {
        angular.bootstrap($app.el.container.is("body") ? document : $app.el.container.get(0), ["$app"]);
    }
    return $app;
}
module.exports = $app;