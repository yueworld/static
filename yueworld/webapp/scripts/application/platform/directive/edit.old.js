/**
 * edit.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 编辑
 */
module.exports = function ($app) {
    $app.register.directive("ysFrameworkEdit", ["$parse", function ($parse) {
        return {
            restrict: 'A',
            link: function (_$scope, element, attrs) {
                var $el = $app.$(element),
                    $scope = angular.extend(_$scope.$new(), {
                        watch: "model.isEdit",
                        expression: "model.isEdit",
                    }, _$scope.$eval(attrs.ysFrameworkEdit));
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
                        $el.unbind("click").find(".ys-framework-dropdown").unbind("click");
                    }
                    if (isEdit && $scope.require) {
                        $el.addClass("ys-framework-require")
                    }
                });
                $scope.$on("$destroy", function () {
                    $el.remove();
                })
            }
        };
    }]);
    $app.register.directive("ysPlatformEdit", ["$parse", function ($parse) {
        return {
            restrict: 'A',
            link: function (_$scope, element, attrs) {
                var $el = $app.$(element),
                    $scope = angular.extend(_$scope.$new(), {
                        watch: "model.isEdit",
                        expression: "model.isEdit",
                    }, _$scope.$eval(attrs.ysFrameworkEdit));
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
                        $el.unbind("click").find(".ys-platform-dropdown").unbind("click");
                    }
                    if (isEdit && $scope.require) {
                        $el.addClass("ys-framework-require")
                    }
                });
                $scope.$on("$destroy", function () {
                    $el.remove();
                })
            }
        };
    }]);
};
