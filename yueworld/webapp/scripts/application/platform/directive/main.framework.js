module.exports = function ($app) {
    // 加载样式
    require("../views/main.framework.css");
    // 引入模版
    $app.run(["$templateCache", function ($templateCache) {
        $templateCache.put("scripts/application/platform/views/icons.html", require("../views/icons.html"));
    }]);
    $app.directive("mainFramework", [function () {
        return {
            restrict: "A", replace: true, template: require("../views/main.framework.html"),
            controller: ["$scope", function ($scope) {
                $app.setSideBarMenus = function (menus) {
                    $scope.sideBarMenus = menus;
                }
                $app.setTopBarMenus = function (menus) {
                    $scope.topBarMenus = menus;
                }
                $app.setTopSubBarMenus = function (menus) {
                    $scope.topBarSubMenus = menus;
                }
                $scope.ysSidebarStatus = $app.cookie.get("ys-sidebar-status", "unfold");
                $scope.toggleSidebar = function () {
                    $app.cookie.set({
                        name: "ys-sidebar-status",
                        value: $scope.ysSidebarStatus = ( $scope.ysSidebarStatus == "fold" ? "unfold" : "fold")
                    });
                    $scope.rbp()
                }
                // ResetBodyPadding
                $scope.rbp = function () {
                    // $app.el.body.css({paddingLeft:$scope.ysSidebarStatus=="fold"?"50px":"180px"})
                }
                $scope.rbp()
            }]
        };
    }]);
};