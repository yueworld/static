/**
 * 构造配置参数
 * @param $config
 * @param $bootstrap
 * @returns {Object}
 */
var isFirstRouterComplete = false, loadingTask;
module.exports = function ($app) {

    $app.defaults = {
        // 获取会话地址
        sessionUrl: undefined,//"sdk/platform/core/init",
        // 默认跳转地址
        otherwise: "", //"/index.html",
        // 异步请求地址
        dynamicUrl: $app.$("base").attr("href") || "/",
        // 静态请求地址
        staticUrl: "http://static.yueworld.cn/",
        // 标题
        title: $app.el.title.text(), _title: "请稍候、系统正在努力加载中。",
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
                    AREAS: [{name: "北部区域", id: "1001"}, {name: "南部区域", id: "1002"}],
                    PROJECTS: [{name: "上海宝龙城市广场", id: "1002", areaId: "1001"}, {
                        name: "上海万科城市广场",
                        id: "1001",
                        areaId: "1002"
                    }],
                }
            }
        },
        // 主菜单配置
        menus: [
            /*{
                text: "基础数据", icon: "basic", state: "basic.info.project.index", includes: "basic",
                child: [
                    {
                        text: "项目信息", state: "basic.info.project.index", includes: "basic.info",
                        child: [
                            {text: "项目维护", state: "basic.info.project.index", includes: "basic.info.project"},
                            {text: "楼栋维护", state: "basic.info.building.index", includes: "basic.info.building"},
                            {text: "楼层维护", state: "basic.info.floor.index", includes: "basic.info.floor"},
                            {text: "产权维护", state: "basic.info.property-ownership.index", includes: "basic.info.property-ownership"},
                            {text: "空间维护", state: "basic.info.space.index", includes: "basic.info.space"},
                            {text: "一铺一价", state: "basic.info.space-package.index", includes: "basic.info.space-package"},
                            {text: "车场信息", state: "basic.info.park.index", includes: "basic.info.park"},
                            {text: "品牌管理", state: "basic.info.brand.index", includes: "basic.info.brand"},
                            {text: "租户管理", state: "basic.info.tenant.index", includes: "basic.info.tenant"}
                        ]
                    },
                    {
                        text: "其他信息", state: "basic.other.area.index", includes: "basic.other",
                        child: [
                            {text: "区域维护", state: "basic.other.area.index", includes: "basic.other.area"},
                            {text: "公司维护", state: "basic.other.company.index", includes: "basic.other.company"}
                        ]
                    }
                ]
            }*/
        ],
        // 头部菜单
        topbar: [],
        // 头部左侧子菜单
        topbarLeftSub: [],
        // 头部右侧子菜单
        topbarRightSub: [],
        // 准备完毕
        ready: angular.noop,
        // 请求超时
        requestTimeout: function ($app) {
            $app.loading(false);
            $app.msgbox.error({
                message: "很抱歉！<br/>由于您的网络原因、请求失败。",
                buttons: [{text: "我要重试", result: true, class: 'ys-platform-btn-danger'}]
            }).then(function () {
                $app.router.reload();
            })
        },
        // 响应异常
        responseError: function ($app, message /* 错误内容 */) {
            $app.loading(false);
            $app.msgbox.error({
                message: $app.helper.template("很抱歉！<br/>${message}", {message: message || "由于服务器内部错误、请求失败。"}),
                buttons: [{text: "我要重试", result: true, class: 'ys-platform-btn-danger'}]
            }).then(function () {
                window.location.reload();
            })
        },
        // 未登录或超时
        needLogin: function ($app, response) {
            $app.loading(false);
            $app.msgbox.error({
                message: "很抱歉！<br/>" + ($app.session.login ? "会话超时、请重新登陆！" : "您尚未登陆、请先去登陆！"),
                buttons: [{text: "去登陆", result: true, class: 'ys-platform-btn-danger'}]
            }).then(function () {
                window.location.href = response.data.login.split("_srk_")[0] + "_srk_=" + encodeURIComponent(window.location.href);
            })
        },
        // 切换页面开始
        stateChangeStart: function ($app, event, toState, toParams, fromState, fromParams) {
            // 未登陆前禁止路由执行
            if (!$app.session.login) {
                event.preventDefault()
            } else if (isFirstRouterComplete) {
                // 显示loading
                loadingTask = $app.loading(true);
            }
            $app.router.name = toState.name;
            $app.router.url = toState.url;
            $app.router.params = toParams;
            // 菜单
            angular.forEach($app.defaults.menus, function (menu) {
                angular.forEach(menu.child, function (child) {
                    if (toState.name.indexOf(child.includes) != -1) {
                        $app.defaults.topbar = menu.child;
                        $app.defaults.topbarLeftSub = child.child;
                        // $app.defaults.topbarRightSub = child.child;
                    }
                })
            })

        },
        // 切换页面成功
        stateChangeSuccess: function ($app, event, toState, toParams, fromState, fromParams) {
            // 首次路由完成、隐藏 预加载框
            if (!isFirstRouterComplete) {
                isFirstRouterComplete = true;
                $app.removeClass($app.el.loading, "in").then(function () {
                    $app.el.loading.hide();
                    $app.el.loading.addClass("complete");
                });
            } else {
                // 隐藏loading
                loadingTask.then(function () {
                    $app.loading(false);
                });
            }

        }
    }
};