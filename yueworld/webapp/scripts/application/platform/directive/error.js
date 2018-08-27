/**
 * error.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 错误提示
 */
module.exports = function ($app) {

    $app.register.directive("ysPlatformError", [function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs", "$timeout", function ($scope, $element, $attrs, $timeout) {
                var $el = $app.$($element),
                    option = $scope.ysPlatformError = angular.extend({property: 'errorCode'}, $scope.$eval($attrs.ysPlatformError));
                $scope.$watch("ysPlatformError.model." + option.property, function (nv) {
                    if (nv == option.code) {
                        option.expression = option.expr ? option.expr : option.expression;
                        if (option.expression == undefined || $scope.$eval(option.expression)) {
                            $timeout(function () {
                                var container = $app.el.body.find("div.ys-platform-product-scrollbar"),
                                    cTop = container.scrollTop(),
                                    elTop = $el.offset().top,
                                    verticalHeight = $app.screen.height / 2,
                                    top = cTop + elTop - verticalHeight;
                                // console.log(elTop + ":" + top + "：" + verticalHeight);
                                container.animate({scrollTop: top});
                                $el.trigger("focus");
                                $el.addClass("ys-platform-error");
                                // 触发下拉列表
                                $el.find(">.ys-platform-dropdown >.ys-platform-dropdown-title").trigger("click");
                            })
                        }
                    } else {
                        $el.removeClass("ys-platform-error");
                    }
                })
            }]
        };
    }]);
}