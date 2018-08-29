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
                var $scope = _$scope.$new(),
                    defaults = $scope.defaults = angular.extend({
                        model: {},
                        isEdit: "model.isEdit"
                    }, $scope.$eval(attrs.ysPlatformEdit)),
                    handlers = [],
                    $container = $app.$(element),
                    dropdown = $container.find(".ys-platform-dropdown");
                $scope.$watch("defaults." + defaults.isEdit, function (isEdit) {
                    isEdit = $scope.$eval("defaults." + defaults.isEdit);
                    if (0 != dropdown.length) {
                        // ys-platform-dropdown
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
                    } else {
                        // input、textarea、div
                        if (handlers.length == 0 & $app.$._data($container.get(0), "events")) {
                            handlers = handlers.concat($app.$._data($container.get(0), "events").click)
                        }
                        if (isEdit) {
                            // 还原事件
                            handlers.filter(function () {
                                return $container.data("unbind");
                            }).forEach(function (handler) {
                                $container.bind("click", handler.handler);
                            });
                            $container.data("unbind", false);
                            if (attrs.uibDatepickerPopup) {
                                // 日历控件、强制为只读控件
                                // $container.addClass("ys-platform-readonly");
                                $container.attr("readonly", true);
                            } else {
                                $container.removeClass("ys-platform-readonly");
                                $container.attr("readonly", false);
                            }
                        } else {
                            // 解除事件
                            $container.unbind("click");
                            $container.addClass("ys-platform-readonly");
                            $container.data("unbind", true);
                            $container.attr("readonly", true);
                        }

                    }
                    if (defaults.require) {
                        // require
                        if (isEdit) {
                            $container.addClass("ys-platform-require")
                        } else {
                            $container.removeClass("ys-platform-require");
                        }
                    }
                });
                $scope.$on("$destroy", function () {
                    $container.remove();
                })
            }
        };
    }]);
};
