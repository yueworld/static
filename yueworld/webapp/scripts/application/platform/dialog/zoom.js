module.exports = function ($app) {
    // 使用示例
    // $app.dialog.zoom({path: ""});
    // 附件管理器
    require("../views/zoom.css")
    $app.dialog.zoom = function (option) {
        var $rootScope = $app.injector.get("$rootScope"),
            $animate = $app.injector.get("$animate"), $q = $app.injector.get("$q"),
            $timeout = $app.injector.get("$timeout"), $compile = $app.injector.get("$compile"),
            $controller = $app.injector.get("$controller"),
            $backdrop = $app.backdrop(),
            $scope = $rootScope.$new(),
            $modal = $app.$(require("../views/zoom.html")),
            option = $scope.option = angular.extend({width: 600}, option);
        $scope.width = option.width;
        $scope.path = option.path;
        $scope.close = function ($callback) {
            $animate.removeClass($modal, "in");
            $timeout(function () {
                $backdrop.hide().then(function () {
                    if (angular.isFunction($callback)) {
                        $callback();
                    }
                    $scope.$destroy();
                });
            }, 200)
        }
        $timeout(function () {
            $animate.addClass($modal, "in");
        }, 200);
        $scope.$on("$destroy", function () {
            $modal.remove();
        })
        $compile($modal)($scope).appendTo($app.el.body)
    }
}