/**
 * input.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 文本框
 */
module.exports = function ($app) {
    /**
     * 静态数据字典
     */
    $app.register.directive("ysPlatformInput", ["$compile", function ($compile) {
        var $input = $app.$("<input " +
            "type='text' " +
            "class='ys-platform-input' " +
            "ng-model='defaults.model[defaults.property]' " +
            "ys-platform-edit='defaults.edit' " +//{model:defaults.edit,require:defaults.require}
            "ys-platform-error='defaults.error'" +
            "placeholder='-- 请填写 --'/>");// {model:defaults.model,code:defaults.code}
        return {
            restrict: "A", replace: true, compile: function (element, $attrs) {
                // 渲染 Input Element
                $input.clone().appendTo(element);
                return {
                    pre: function ($scope, element, $attrs) {
                        var defaults = $scope.defaults = angular.extend({
                            // 模型
                            model: {},
                            // 编辑
                            edit: {},
                            // 异常
                            error: {},
                            // 是否必填
                            require: false,
                            // Error Code
                            code: undefined
                        }, $scope.$eval($attrs.ysPlatformInput));
                    }
                }
            }
        }
    }]);
}