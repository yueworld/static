/**
 * error.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 错误提示
 */
module.exports = function ($app) {
    require("../views/error.css");
    /*$app.directive("error", ["$timeout", function ($timeout) {
        return {
            restrict: "A", controller: ["$scope", "$element", "$attrs", "$parse", function ($scope, $element, $attrs) {
                var $el = $app.$($element);
                $attrs.$observe('error', function (errorCode) {
                    if (errorCode === $attrs.code) {
                        if (!$attrs.expression || $scope.$eval($attrs.expression)) {
                            var container = $app.el.body.find("div.ys-framework-product-container");
                            if ($attrs.select2) {
                                $el.next().find("span.select2-selection").addClass("error")
                                container.animate({scrollTop: container.scrollTop() + ($el.next().offset().top - ($app.screen.height / 2) + 48)});
                            } else {
                                $el.addClass("error");
                                container.animate({scrollTop: container.scrollTop() + ($el.offset().top - ($app.screen.height / 2))});
                            }
                        }
                    } else {
                        if ($attrs.select2) {
                            $el.next().find("span.select2-selection").removeClass("error")
                        } else {
                            $el.removeClass("ys-framework-error");
                        }
                    }
                });
            }]
        };
    }]);*/
    /**
     * 错误提示、定位
     */
    $app.directive("ysFrameworkError", [function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs", "$timeout", function ($scope, $element, $attrs, $timeout) {
                var $el = $app.$($element),
                    option = $scope.ysFrameworkError = angular.extend({property: 'errorCode'}, $scope.$eval($attrs.ysFrameworkError));
                $scope.$watch("ysFrameworkError.model." + option.property, function (nv) {
                    if (nv == option.code) {
                        if (!option.expression || $scope.$eval(option.expression)) {
                            $timeout(function () {
                                var container = $app.el.body.find("div.ys-framework-product-container"),
                                    cTop = container.scrollTop(),
                                    elTop = $el.offset().top,
                                    verticalHeight = $app.screen.height / 2,
                                    top = cTop + elTop - verticalHeight;
                                // console.log(elTop + ":" + top + "：" + verticalHeight);
                                container.animate({scrollTop: top});
                                $app.$($element).trigger("focus");
                                $el.addClass("ys-framework-error");
                            })
                        }
                    } else {
                        $el.removeClass("ys-framework-error");
                    }
                })
            }]
        };
    }]);
}