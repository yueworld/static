/**
 * edit.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 编辑
 */
module.exports = function ($app) {
    $app.register.directive("ysPlatformEdit", ["$parse", "$timeout", function ($parse, $timeout) {
        return {
            restrict: 'A',
            link: function (_$scope, element, attrs) {
                var $el = $app.$(element),
                    $scope = angular.extend(_$scope.$new(), {
                        watch: "model.isEdit",
                        expression: "model.isEdit",
                    }, _$scope.$eval(attrs.ysPlatformEdit));
                var handlers = [];
                $scope.$watch($scope.watch, function (isEdit) {
                    isEdit = $scope.$eval($scope.expression);
                    if ($el.is("input") || $el.is("textarea")) {
                        // input、textarea
                        if (handlers.length == 0 & $app.$._data($el.get(0), "events")) {
                            handlers = handlers.concat($app.$._data($el.get(0), "events").click)
                        }
                        if (isEdit) {
                            // 还原事件
                            $el.removeClass("ys-platform-readonly");
                            handlers.filter(function () {
                                return $el.data("unbind");
                            }).forEach(function (handler) {
                                $el.bind("click", handler.handler);
                            })
                            $el.data("unbind", false);
                            $el.attr("readonly", false);
                        } else {
                            // 解除事件
                            $el.unbind("click");
                            $el.addClass("ys-platform-readonly");
                            $el.data("unbind", true);
                            $el.attr("readonly", true);
                        }
                    } else if (0 != $el.find(".ys-platform-dropdown").length) {
                        // ys-platform-dropdown
                        var dropdown = $el.find(".ys-platform-dropdown");
                        if (handlers.length == 0) {
                            handlers = handlers.concat($app.$._data(dropdown.get(0), "events").click);
                        }
                        if (isEdit) {
                            dropdown.removeClass("ys-platform-readonly");
                            // 还原事件
                            handlers.filter(function () {
                                return dropdown.data("unbind");
                            }).forEach(function (handler) {
                                dropdown.bind("click", handler.handler);
                            })
                            dropdown.data("unbind", false);
                        } else {
                            // 解除事件
                            dropdown.unbind("click");
                            dropdown.addClass("ys-platform-readonly");
                            dropdown.data("unbind", true);
                        }
                    }
                    if ($scope.require) {
                        // require
                        if (isEdit) {
                            $el.addClass("ys-platform-require")
                        } else {
                            $el.removeClass("ys-platform-require");
                        }
                    }
                });
                $scope.$on("$destroy", function () {
                    $el.remove();
                })
            }
        };
    }]);
};
