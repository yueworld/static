module.exports = function ($app) {
    // 隐藏显示面板
    $app.directive("togglePanel", ["$timeout", function ($timeout) {
        return {
            restrict: "A", transclude: true,
            template: "<div ng-transclude></div>",
            link: function ($scope, $element, $attr) {
                $scope.show = $app.cookie.get("ys-toggle-panel-folding-status-" + $attr.key, "2") == "1";
                if (!$scope.show) {
                    $app.$($element).hide();
                }
                $app.autoDestroyEvent($scope, [$app.subscribe("/ys/toggle/panel", function (event, data) {
                    if ($attr.key == data.key) {
                        $scope.show = !$scope.show;
                        $app.$($element).slideToggle("fast");
                        $app.cookie.set({
                            name: "ys-toggle-panel-folding-status-" + $attr.key, value: $scope.show ? "1" : "2"
                        });
                    }
                })])
            }
        }
    }])
}