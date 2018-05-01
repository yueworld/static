/**
 * error.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 错误提示
 */
module.exports = function ($app) {
    /**
     * 回车事件  ys-framework-keyboard-enter="refresh()"
     */
    $app.directive("ysFrameworkKeyboardEnter", [function () {
        return {
            restrict: "A",
            controller: ["$scope", "$timeout", "$element", "$attrs", function ($scope, $timeout, $element, $attrs) {
                var $el = $app.$($element);
                $el.keyup(function (event) {
                    if ((window.event ? event.keyCode : event.which) == 13) {
                        $timeout(function () {
                            $scope.$eval($attrs.ysFrameworkKeyboardEnter);
                        })
                    }
                })
            }]
        };
    }]);
}