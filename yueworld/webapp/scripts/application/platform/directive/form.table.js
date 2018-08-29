/**
 * form.table.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 静态下拉选择框
 */
module.exports = function ($app) {
    require("../views/form.table.scss");
    var template = require("../views/form.table.html");
    /**
     * 静态数据字典
     */
    $app.register.directive("ysPlatformFormTable", [function () {

        // 渲染 UI
        function render(defaults, $container) {
            var $title = $container.find(">.ys-platform-form-table-title"),
                $body = $container.find(">.ys-platform-form-table-body"),
                $table = $body.find(">table");
            if (defaults.title) {
                $title.find("h3").text(defaults.title);
            } else {
                $title.hide();
            }
            $title.click(function () {
                $body.height($table.height());
                setTimeout(function () {
                    $container.toggleClass("ys-platform-form-table-up");
                }, 1)
            })
        }

        return {
            restrict: "A", replace: true, template: template, transclude: true, link: function (_$scope, element, $attrs) {
                var $scope = _$scope.$new(),
                    defaults = $scope.defaults = angular.extend({
                        // 标题
                        title: undefined,
                        model: {},
                        // 列样式
                        colgroup: [
                            {width: "100%"}
                        ],
                        // 行内容
                        rows: [
                            // 列
                            [
                                // 具体列
                                {
                                    // 标题
                                    label: "申报项目",
                                    // 字段名
                                    field: "",
                                    // 编辑
                                    edit: {},
                                    // 错误
                                    error: {},
                                    // 列合并
                                    colspan: 0,
                                    // 行合并
                                    rowspan: 0,
                                    // 类型
                                    type: "div/input/d.static/d.dynamic/d.project/d.tree"
                                }
                            ]
                        ]
                    }, $scope.$eval($attrs.ysPlatformFormTable)),
                    $container = $app.$(element).addClass(defaults.class);

                // 渲染
                render(defaults, $container);

                $scope.$on("$destroy", function () {
                    // console.log(111111111111)
                });

            }
        };
    }]);
}