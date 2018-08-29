module.exports = function ($app) {
    // 加载样式
    require("../views/app.scss");
    var $ = $app.$,
        $menu = $("<div class='item'/>"),
        $sidebarItems = [];
    $app.register.directive("ysPlatformApp", [function () {
        return {
            restrict: "A", replace: true, template: require("../views/app.html"),
            controller: ["$scope", function ($scope) {
            }],
            compile: function (element, $attrs) {
                var key = $app.helper.signature("ys-platform-app"),
                    value = $app.cookie.get(key, "unfold"),
                    $container = $(element).addClass(value),
                    $topbar = $container.find("div.ys-platform-topbar"),
                    $topbarFold = $topbar.find("div.fold"),
                    $topbarFullscreen = $topbar.find("div.fullscreen div.dropdown-toggle"),
                    $sidebar = $container.find("div.ys-platform-sidebar"),
                    $sidebarContainer = $sidebar.find("div.ys-platform-sidebar-container");
                // 收起、显示菜单
                $topbarFold.click(function () {
                    $container.removeClass(value)
                    $app.cookie.set({name: key, value: value = (value == "fold" ? "unfold" : "fold")});
                    $container.addClass(value);
                });
                // 生成菜单
                $app.defaults.menus.filter(function (menu) {
                    return !menu.hidden;
                }).forEach(function (menu) {
                    $sidebarItems.push($menu.clone().html(menu.text).attr("state", menu.state).attr("includes", menu.includes).data(menu).appendTo($sidebarContainer));
                });
                $sidebarContainer.append('<div class="line hidden"></div>');
                // 跳转
                $sidebarContainer.on("click", "div.item", function (event) {
                    var self = $(event.currentTarget);
                    $app.router.go(self.attr("state"));
                });
                // 全屏
                $topbarFullscreen.click(function () {
                    if ($app.screen.isFullscreen) {
                        $app.screen.exitFullscreen()
                        $topbarFullscreen.html("进入全屏");
                    } else {
                        $app.screen.fullscreen();
                        $topbarFullscreen.html("退出全屏");
                    }
                })
            }
        };
    }]);

    // 启动初始化
    $app.register.run(["$rootScope", function ($rootScope) {
        // 每次路由成功时执行
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $sidebarItems.forEach(function (item) {
                // 激活菜单
                if ($app.router.includes(item.attr("includes"))) {
                    item.addClass("active");
                } else {
                    item.removeClass("active");
                }
            });
        });
    }]);
};