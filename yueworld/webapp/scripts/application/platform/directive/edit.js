/**
 * edit.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 编辑
 */
module.exports = function ($app) {
    $app.directive("ysPlatformEdit", ["$parse", "$timeout", function ($parse, $timeout) {
        return {
            restrict: 'A',
            link: function (_$scope, element, attrs) {
                var $el = $app.$(element),
                    $scope = angular.extend(_$scope.$new(), {
                        watch: "model.isEdit",
                        expression: "model.isEdit",
                    }, _$scope.$eval(attrs.ysPlatformEdit));
                $scope.$watch($scope.watch, function (isEdit) {
                    isEdit = $scope.$eval($scope.expression);
                    if ($el.is("input") || $el.is("textarea")) {
                        if (!isEdit) {
                            $el.hide();
                            $el.after("<span class='pl15 viewer'>" + $el.val() + "</span>")
                        } else {
                            $el.show();
                            $el.next("span.viewer").remove();
                        }
                    }
                    if (!isEdit) {
                        $el.unbind("click").find(".ys-platform-dropdown-static,.ys-platform-dropdown-dynamic").unbind("click");
                    }
                    if (isEdit && $scope.require) {
                        $el.addClass("ys-platform-require")
                    }
                });
                $scope.$on("$destroy", function () {
                    $el.remove();
                })
            }
        };
    }]);
};
