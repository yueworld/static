/**
 * dropdown.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 动态下拉选择框
 */
// 引入样式
require("../views/dropdown.project.scss");

module.exports = function ($app) {

    var template = require("../views/dropdown.project.html");

    /**
     * 静态数据字典
     */
    $app.directive("ysPlatformDropdownProject", [function () {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$q", "$compile", "$element", "$attrs", function (_$scope, $q, $compile, $element, $attrs) {

                var $container = $app.$(template),
                    $scope = _$scope.$new(),
                    option = $scope.option = angular.extend({
                        // 待操作的模型
                        model: {},
                        // 值字段名、唯一编号
                        idField: "id",
                        // 显示文本字段名
                        textField: "text",
                        // 选中item后、针对model的赋值关系
                        set: {
                            /* key 为 选中 对象的属性、value 为要设置给 model 的属性、示例：    id:"projectId"、id:"companyId" */
                            /* selectedItem.property: model.property */
                            id: "id"
                        },
                        // 默认宽度
                        width: "100%",
                        // 选中回调事件、参数：select(selectedItem、model)
                        select: angular.noop,
                        theme: "default", /* default、caret */
                        filter: {}
                    }, $scope.$eval($attrs.ysPlatformDropdownProject)),
                    // 默认提示
                    placeholder = option.placeholder = option.placeholder || "-- 请选择 --",
                    defaultOption = {},
                    projects = $scope.projects = $app.dictionary.PROJECTS.options.filter(function (item) {
                        return option.model[option.set[option.idField]] == item.id;
                    });
                defaultOption[option.idField] = -1;
                defaultOption[option.textField] = $app.valid.startsWith(placeholder, "-") ? placeholder : "请选择" + placeholder;
                placeholder = option.placeholder = $app.valid.startsWith(placeholder, "-") ? placeholder : "所有" + placeholder;
                if ($app.dictionary.PROJECTS.hash[option.model[option.set.id]]) {
                    option.filter.areaId = $app.dictionary.PROJECTS.hash[option.model[option.set.id]].areaId;
                    console.log(option.filter.areaId)
                }

                // 选择区域、加载项目
                $scope.selectArea = function (_item) {
                    option.filter.areaId = _item.id;
                    // 清空数据
                    projects = $scope.projects = [];
                    // 筛选项目
                    angular.forEach($app.dictionary.PROJECTS.options, function (item) {
                        if (item.areaId == _item.id) {
                            projects.push(item);
                        }
                    })
                }
                // 选择项目、加载商户
                $scope.selectProject = function (item) {
                    if (item[option.idField] != "-1") {
                        angular.forEach(option.set, function (key, value) {
                            option.model[key] = item[value];
                        })
                    } else {
                        clear();
                        option.model[option.set[option.idField]] = "";
                    }
                    if (angular.isFunction(option.select)) {
                        option.select(item, option.model);
                    }
                    $container.removeClass("open");
                }

                $scope.$watch("option.filter.term", function (n, o) {
                    if (n != o) {
                        option.filter.areaId = undefined;
                        projects = $scope.projects = [];
                        angular.forEach($app.dictionary.PROJECTS.options, function (item) {
                            if (item.name.indexOf(n) != -1) {
                                projects.push(item);
                            }
                        })
                    }
                })
                if (option.theme == "caret") {
                    $container.addClass("theme-caret");
                    option.width = "initial";
                }
                // 显示 与 隐藏 dropdown
                $container.on("click", ".ys-platform-dropdown-toggle", function () {
                    $app.$("div.ys-platform-dropdown-static,div.ys-platform-dropdown-dynamic,div.ys-platform-dropdown-project").not($container).removeClass("open")
                    $container.toggleClass("open");
                    if ($container.hasClass("open")) {
                        $container.find(".ys-platform-dropdown-search input").trigger("focus");
                        $app.el.body.one("click", function () {
                            $container.removeClass("open");
                        })
                    }
                });
                $container.width(option.width);
                $element.append($compile($container)($scope));
            }]
        };
    }]);
}