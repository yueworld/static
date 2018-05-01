module.exports = function ($app) {
    $app.config(["$stateProvider", function ($state) {
        // 数据中心
        $state.state("basic", {
            url: "/basic", "abstract": true,
            template: '<div class="col-xs-12 p0"><div class="col-xs-12 p0 bg-white animated-ui-view fadeIn fadeOut" ui-view></div></div>',
            controller: function () {
                $app.setSideBarMenus([
                    {text: "首页", icon: "my", state: "basic.info.project.index", includes: "my"},
                    {text: "报表", icon: "report", state: "basic.info.project.index", includes: "report"},
                    {text: "基础数据", icon: "basic", state: "basic.info.head.index", includes: "basic"},
                    {text: "管理", icon: "basic", state: "basic.info.head.index", includes: "basic"},
                    {text: "招商", icon: "investment", state: "basic.info.project.index", includes: "investment"},
                    {text: "营运", icon: "operations", state: "basic.info.project.index", includes: "operations"},
                ])
                // 初始化菜单
                $app.setTopBarMenus([
                    {text: "基础数据", state: "basic.info.head.index", includes: "basic.info"},
                    {text: "指标", state: "basic.info.head.index", includes: "basic.indicators"}
                ])
            }
        });
        // 基础资料
        $state.state("basic.info", {url: "/info", "abstract": true, template: require("../views/info.default.html")});
        // 基础数据
        [
            // 甲方抬头
            require("./head"),
            // 项目
            require("./project"),
            // 项目
            require("./brand")
        ].forEach(function (callback) {
            callback($app, $state)
        });
    }]);
}