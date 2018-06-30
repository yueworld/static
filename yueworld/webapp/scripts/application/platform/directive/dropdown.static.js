/**
 * dropdown.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 动态下拉选择框
 */
// 引入样式
require("../views/dropdown.static.scss");

module.exports = function ($app) {

    var template = require("../views/dropdown.static.html");

    /**
     * 静态数据字典
     */
    $app.directive("ysPlatformDropdownStatic", [function () {
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
                        // 开启查询
                        dictionary: [],
                        // 默认宽度
                        width: "100%",
                        // 选中回调事件、参数：select(selectedItem、model)
                        select: angular.noop,
                        theme: "default" /* default、caret */
                    }, $scope.$eval($attrs.ysPlatformDropdownStatic)),
                    // 默认提示
                    placeholder = option.placeholder = option.placeholder || "-- 请选择 --",
                    defaultOption = {};
                defaultOption[option.idField] = -1;
                defaultOption[option.textField] = $app.valid.startsWith(placeholder, "-") ? placeholder : "请选择" + placeholder;
                placeholder = option.placeholder = $app.valid.startsWith(placeholder, "-") ? placeholder : "所有" + placeholder;

                // 必要参数检测
                if (!angular.isObject(option.set) || !option.set.id) {
                    $app.$($element).addClass("col-xs-12 pointer lh36 ys-platform-error").css({color: "red"}).text("-- Error：set.id 未定义！ --");
                    return;
                }
                if (angular.isString(option.dictionary)) {
                    $scope.dictionary = $app.dictionary.build([defaultOption].concat($app.dictionary[option.dictionary] ? $app.dictionary[option.dictionary].options : []));
                } else if (angular.isArray(option.dictionary)) {
                    // 使用入参作为数据字典
                    $scope.$watch("option.dictionary", function () {
                        $scope.dictionary = $app.dictionary.build([defaultOption].concat(option.dictionary));
                    }, true);
                } else {
                    $app.$($element).addClass("col-xs-12 pointer lh36 ys-platform-error").css({color: "red"}).text("-- Error：dictionary 类型错误！ --");
                    return;
                }

                // 清理数据
                function clear() {
                    angular.forEach(option.set, function (key, value) {
                        delete option.model[key];
                    })
                }

                // 是否选中
                $scope.active = function (item) {
                    return item[option.idField] == option.model[option.set.id] || (!option.model[option.set.id] && item[option.idField] == '-1')
                }
                // 选中
                $scope.select = function (item) {
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