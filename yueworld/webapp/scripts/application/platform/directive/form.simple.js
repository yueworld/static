/**
 * form.static.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 静态下拉选择框
 */
module.exports = function ($app) {

    var template = require("../views/dropdown.static.html"),
        $option = $app.$("<div class=\"option\"><i/></div>"),
        $tag = $app.$("<span class='tag'> <i class=\"svg-container\" style=\"width: 8px; height: 18px; display: inline-block;\"><svg style=\"width: 8px; height: 18px;\"><use xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#icon-close-1\" svg-href=\"close-1\"></use></svg></i></span>");
    /**
     * 静态数据字典
     */
    $app.register.directive("ysPlatformForm", [function () {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$q", "$element", "$attrs", "$timeout", function (_$scope, $q, $element, $attrs, $timeout) {

            }]
        };
    }]);
}