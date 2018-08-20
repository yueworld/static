/**
 * img.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 错误提示
 */
module.exports = function ($app) {
    $app.register.directive("ysPlatformZoom", [function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs", "$timeout", function ($scope, $element, $attrs, $timeout) {
                var option = $scope.option = angular.extend({}, $scope.$eval($attrs.ysPlatformZoom));
                if (option.url) {
                    $element.click(function () {
                        $app.platform.dialog.zoom(option);
                    })
                } else {
                    $app.tip.error({message: "ysPlatformZoom -> 未制定 url"});
                }
            }]
        };
    }]);
}