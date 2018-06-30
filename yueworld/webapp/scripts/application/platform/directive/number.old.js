/**
 * number.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 编辑
 */
module.exports = function ($app) {
    $app.directive("ysFrameworkNumber", [function () {
        return {
            restrict: "A",
            replace: true,
            // {input:'模型',property:'字段',scale:'小数位数'}
            controller: ["$scope", "$timeout", "$element", "$attrs", "$parse", "$filter", function (_$scope, $timeout, $element, $attrs, $parse, $filter) {
                try {
                    var $scope = _$scope.$new(),
                        $el = $app.$($element), option = $scope.option = angular.extend({
                            model: {}, scale: 2
                        }, _$scope.$eval($attrs.ysFrameworkNumber)),
                        model = option.model, timer = 0;
                    if ($el.is("input")) {
                        var placeholder = $el.attr("placeholder");
                        // 还原/重置 placeholder
                        $el.focus(function () {
                            // 回显
                            $el.val(model[option.property]);
                            // 默认
                            $el.attr("placeholder", "/");
                            // 焦点
                            $el.css({outline: "2px solid #91c0f1", backgroundColor: "#f3f4f8"});
                        });
                        // 错误提示
                        $el.blur(function () {
                            var before = $el.val()/*原始内容*/,
                                after = $filter("number")($el.val(), option.scale)/*格式化后的内容*/;
                            // 默认
                            $el.attr("placeholder", placeholder);
                            // 去除焦点
                            $el.css({outline: "0px solid #91c0f1", backgroundColor: ""});
                            // 设值
                            if (before == "") {
                                $el.val("");
                            } else {
                                $el.val(after);
                                if (after <= 0 && before != "0"/*原始内容输入的就是0则不提示错误*/) {
                                    // 格式错误
                                    $timeout(function () {
                                        $app.tip.error({message: "格式错误！"});
                                    })
                                }
                            }
                        });
                        // 回写模型
                        $el.keyup(function () {
                            var value = $filter("number")($el.val(), option.scale).replace(new RegExp(",", "gm"), "");
                            $timeout.cancel(timer);
                            timer = $timeout(function () {
                                model[option.property] = value > -1 ? value : undefined;
                            }, 100)
                        })
                        // 初始值
                        $el.val(model[option.property]);
                    }
                } catch (ex) {
                    console.log("数字指令 ysFrameworkNumber Error：" + ex.message);
                }
            }]
        };

    }]);
}