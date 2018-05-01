module.exports = function ($app) {
    require("../views/tip.css");

    angular.forEach(["ysFrameworkTip", "ysTip"], function (directiveName) {
        $app.directive(directiveName, ["$timeout", "$filter", "$uibPosition", function ($timeout, $filter, uibPosition) {
            return {
                restrict: "A",
                replace: true,
                controller: ["$scope", "$element", "$attrs", "$parse", function (_$scope, $element, $attrs, $parse) {
                    try {
                        var $scope = _$scope.$new(),
                            $el = $app.$($element),
                            option = $scope.option = angular.extend({
                                model: {},
                                template: "{0}",
                                isNumber: false,
                                scale: 2
                            }, _$scope.$eval($attrs[directiveName])),
                            model = option.model, timer = 0,
                            tooltip = $app.$(require("../views/tip.css"));
                        $el.addClass("text-ellipsis");
                        $el.hover(function () {
                            var offset = uibPosition.offset($el), message = option.model[option.property];
                            if (message) {
                                if (option.isNumber) {
                                    message = $filter("number")(message, option.scale);
                                }
                            }
                            $el.append(tooltip);
                            tooltip.find("div.inner").html($app.data.format(option.template, message || "未定义！"));
                            if ($app.number.add(offset.left, tooltip.width() + 20, 2) > $app.window.width()) {
                                tooltip.css({right: 0});
                            }
                            $timeout(function () {
                                tooltip.addClass("in");
                            })
                        }, function () {
                            // tooltip.removeClass("in");
                            // $timeout(function () {
                            //     tooltip.remove();
                            // }, 150);
                        });
                    } catch (ex) {
                        console.log("数字指令 " + directiveName + " Error：" + ex.message);
                    }
                }]
            };
        }]);
    })
}