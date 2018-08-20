module.exports = function ($app) {

    // 注册路由
    $app.register.config(["$stateProvider", function ($state) {
        // 数据中心、一级目录
        $state.state("basic", {
            url: "/basic", "abstract": true,
            template: '<div class="col-xs-12 p0"><div class="col-xs-12 p0 bg-white animated-ui-view fadeIn fadeOut" ui-view></div></div>',
            controller: function () {
                $app.setSideBarMenus([
                    {text: "基础数据", icon: "basic", state: "basic.info.area.index", includes: "basic"},
                ])
                // 初始化菜单
                $app.setTopBarMenus([
                    {text: "基础数据", state: "basic.info.head.index", includes: "basic.info"},
                ])
            }
        });
        // 基础资料
        $state.state("basic.info", {url: "/info", "abstract": true, template: require("../views/info.default.html")});


        // 基础资料
        [
            // 项目管理
            require("./project"),
        ].forEach(function (callback) {
            callback($app, $state)
        });

    }]);

}