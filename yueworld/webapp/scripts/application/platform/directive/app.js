module.exports = function ($app) {
    // 加载样式
    require("../views/app.scss");
    $app.register.directive("ysPlatformApp", [function () {
        return {
            restrict: "A", replace: true, template: require("../views/app.html"),
            controller: ["$scope", function ($scope) {
                $scope.ysSidebarStatus = $app.cookie.get("ys-sidebar-status", "unfold");
                $scope.toggleSidebar = function () {
                    $app.cookie.set({
                        name: "ys-sidebar-status",
                        value: $scope.ysSidebarStatus = ($scope.ysSidebarStatus == "fold" ? "unfold" : "fold")
                    });
                }
            }]
        };
    }]);
};