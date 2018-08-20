/**
 * number.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 编辑
 */
module.exports = function ($app) {
    $app.register.directive("ysPlatformNumber", [function () {
        return {
            restrict: "A",
            replace: true,
            // {input:'模型',property:'字段',scale:'小数位数'}
            controller: ["$scope", "$timeout", "$element", "$attrs", "$parse", "$filter", function (_$scope, $timeout, $element, $attrs, $parse, $filter) {
                try {
                    var $scope = _$scope.$new(),
                        $el = $app.$($element), option = $scope.option = angular.extend({
                            model: {}, scale: 2
                        }, _$scope.$eval($attrs.ysPlatformNumber)),
                        model = option.model, timer = 0;
                    if ($el.is("input")) {
                        /*$el.focus(function () {
                            // 回显
                            // $el.val($app.number.parse(model[option.property]) != 0 ? model[option.property] : undefined);
                        });*/
                        // 错误提示
                        $el.blur(function () {
                            var before = $el.val()/*原始内容*/,
                                after = $app.number.parse(before, option.scale)/*格式化后的内容*/;
                            if ($app.helper.trim(before)) {
                                if (before != "0" && after == 0) {
                                    $app.tip.error({message: "格式错误！"})
                                    $el.val("");
                                } else {
                                    $el.val(after);
                                }
                            } else {
                                $el.val("");
                            }
                        });
                        // 回写模型
                        $el.keyup(function () {
                            $timeout(function () {
                                model[option.property] = $app.number.parse($el.val(), option.scale);
                            })
                        })
                        // 初始值
                        $el.val($app.number.parse(model[option.property], option.scale) != 0 ? model[option.property] : undefined);
                    }
                } catch (ex) {
                    console.log("数字指令 ysPlatformNumber Error：" + ex.message);
                }
            }]
        };
    }]);
}