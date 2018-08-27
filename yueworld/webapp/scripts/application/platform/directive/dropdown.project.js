/**
 * dropdown.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 项目选择框
 */
// 引入样式
require("../views/dropdown.project.scss");

module.exports = function ($app) {
    var template = require("../views/dropdown.project.html");
    /**
     * 项目选择
     */
    $app.register.directive("ysPlatformDropdownProject", [function () {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$q", "$compile", "$element", "$attrs", function (_$scope, $q, $compile, $element, $attrs) {
                var $scope = _$scope.$new(),
                    defaults = $scope.defaults = angular.extend({
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
                    $container = $app.$(template).addClass(defaults.multi /* 多选 */ ? "multi" : "").addClass(defaults.theme == "caret" ? "theme-caret" : "").width(defaults.width ? defaults.width : (defaults.theme == "caret" ? "initial" : "100%")),
                    $title = $container.find(".ys-platform-dropdown-title"),
                    $placeholder = $title.find(".placeholder"),
                    $text = $title.find(".text"),
                    $tags = $title.find(".tags"),
                    $body = $container.find(".ys-platform-dropdown-body"),
                    $tips = $body.find(".ys-platform-dropdown-body-tips"),
                    $input = $body.find(".ys-platform-dropdown-body-search input"),
                    $options = $body.find(".ys-platform-dropdown-body-options"),
                    idField = defaults.idField,
                    textField = defaults.textField,
                    multi = defaults.multi,
                    set = defaults.set,
                    path = defaults.path,
                    includes = defaults.includes,
                    excludes = defaults.excludes,
                    // 默认提示
                    placeholder = defaults.placeholder = defaults.placeholder || "-- 请选择 --",
                    defaultOption = {},
                    projects = $scope.projects = $app.dictionary.PROJECTS.options.filter(function (item) {
                        return defaults.model[set[idField]] == item.id;
                    });
                defaultOption[idField] = -1;
                defaultOption[textField] = $app.valid.startsWith(placeholder, "-") ? placeholder : "请选择" + placeholder;
                placeholder = defaults.placeholder = $app.valid.startsWith(placeholder, "-") ? placeholder : "所有" + placeholder;
                $placeholder.text(placeholder);

                if ($app.dictionary.PROJECTS.hash[defaults.model[set.id]]) {
                    defaults.filter.areaId = $app.dictionary.PROJECTS.hash[defaults.model[set.id]].areaId;
                }

                // 监控 model 上 idField 字段的变化、重制默认选项
                $scope.$watch("defaults.model." + set[idField], function (nv) {
                    if (!nv) {
                        $tags.hide();
                        $text.hide();
                        $placeholder.show();
                    } else {
                        if ($app.dictionary.PROJECTS.hash[nv]) {
                            $text.text($app.dictionary.PROJECTS.hash[nv][textField]).show();
                            $placeholder.hide();
                        } else {
                            $text.hide();
                            $placeholder.show();
                        }
                    }
                });

                // 选择区域、加载项目
                $scope.selectArea = function (_item) {
                    defaults.filter.areaId = _item.id;
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
                    if (item[idField] != "-1") {
                        angular.forEach(set, function (key, value) {
                            defaults.model[key] = item[value];
                        })
                    } else {
                        defaults.model[set[idField]] = "";
                    }
                    if (angular.isFunction(defaults.select)) {
                        defaults.select(item, defaults.model);
                    }
                    $container.removeClass("open");
                }
                $scope.clear = function () {
                    $container.removeClass("open");
                    defaults.model[set[idField]] = "";
                }
                $scope.$watch("defaults.filter.term", function (n, o) {
                    if (n != o) {
                        defaults.filter.areaId = undefined;
                        projects = $scope.projects = [];
                        angular.forEach($app.dictionary.PROJECTS.options, function (item) {
                            if (item.name.indexOf(n) != -1) {
                                projects.push(item);
                            }
                        })
                    }
                });
                // 显示 与 隐藏 dropdown
                $title.click(function () {
                    $app.$(".ys-platform-dropdown").not($container).removeClass("open");
                    $container.toggleClass("open");
                    if ($container.hasClass("open")) {
                        $input.trigger("focus");
                        $app.el.body.one("click", function () {
                            $container.removeClass("open");
                        })
                    }
                });
                $container.click(function ($event) {
                    $event.stopPropagation();
                });
                $element.append($compile($container)($scope));
            }]
        };
    }]);
}