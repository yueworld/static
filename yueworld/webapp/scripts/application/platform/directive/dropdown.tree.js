/**
 * dropdown.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 下拉选择框
 */
// 引入样式
require("../views/dropdown.tree.scss");

module.exports = function ($app) {
    var template = require("../views/dropdown.tree.html");
    /**
     * 业态选择
     */
    $app.register.directive("ysPlatformDropdownTree", [function () {
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
                        // config path 支持 disconf 取值 /dictionary/BILLING_PAYMENT_UNIT_TYPES/1001/01
                        path: "",
                        // 默认宽度
                        width: undefined,
                        // 选中回调事件、参数：select(selectedItem、model)
                        select: angular.noop,
                        theme: "default", /* default、caret */
                        filter: {},
                        // 允许选择目录
                        dirSelectable: false,
                        // 允许多选
                        multi: false,
                        // 允许取消选择
                        allowDeselect: true,
                        dictionary: [],
                        search: false,
                        // 允许操作
                        isSelectable: function (item) {
                            return item.id != -9999 && item.id != -1;
                        }
                    }, $scope.$eval($attrs.ysPlatformDropdownTree)),
                    $container = $app.$(template).addClass(defaults.theme == "caret" ? "theme-caret" : "").width(defaults.width ? defaults.width : (defaults.theme == "caret" ? "initial" : "100%")),
                    $title = $container.find(".ys-platform-dropdown-title"),
                    $placeholder = $title.find(".placeholder"),
                    $text = $title.find(".text"),
                    $body = $container.find(".ys-platform-dropdown-body"),
                    $tips = $body.find(".ys-platform-dropdown-body-tips"),
                    $input = $body.find(".ys-platform-dropdown-body-search input"),
                    idField = defaults.idField,
                    textField = defaults.textField,
                    multi = defaults.multi,
                    set = defaults.set, path = defaults.path,
                    treeOptions = $scope.treeOptions = {
                        nodeChildren: "children",
                        // 能否选择目录
                        dirSelectable: defaults.dirSelectable,
                        // 是否可以多选
                        multiSelection: defaults.multi,
                        // 允许取消选择
                        allowDeselect: defaults.allowDeselect,
                        // 是否允许选择
                        isSelectable: defaults.isSelectable,
                        injectClasses: {/*  ul: "a1",li: "a2",liSelected: "a7",iExpanded: "a3",iCollapsed: "a4",iLeaf: "a5",label: "a6",labelSelected: "a8"*/}
                    },
                    treeModel = $scope.treeModel = [],
                    // 默认提示
                    placeholder = defaults.placeholder = defaults.placeholder || "-- 请选择 --",
                    placeholder = defaults.placeholder = $app.valid.startsWith(placeholder, "-") ? placeholder : "所有" + placeholder;
                $placeholder.text(placeholder);


                // 必要参数检测
                if (!angular.isObject(set) || !set.id) {
                    $app.$($element).addClass("col-xs-12 pointer lh36 ys-platform-error").css({color: "red"}).text("-- Error：set.id 未定义！ --");
                    return;
                }

                // disconf path 数据源
                if (angular.isString(path) && $app.helper.trim(path)) {
                    var value = $app.config.path(path);
                    if (value && value.children && value.children.length) {
                        defaults.dictionary = [];
                        angular.forEach(value.children, function (item) {
                            defaults.dictionary.push(angular.extend({}, item, {id: item.property}));
                        })
                    }
                }

                // 数组
                if (angular.isArray(defaults.dictionary)) {
                    if (0 == defaults.dictionary.length) {
                        defaults.dictionary = $app.dictionary.build([{id: -1, name: "未添加任何可选项！"}], true);
                    } else {
                        defaults.dictionary = $app.dictionary.build(defaults.dictionary, true);
                    }
                }
                // 字典
                else if (angular.isString(defaults.dictionary)) {
                    defaults.dictionary = $app.dictionary.build($app.dictionary[defaults.dictionary] ? angular.copy($app.dictionary[defaults.dictionary].all, []) : [], true);
                }
                // 异常
                else {
                    $app.$($element).addClass("col-xs-12 ys-platform-pointer ys-platform-lh32 ys-platform-error").css({color: "red"}).text("-- Error：dictionary 类型错误！ --");
                    return;
                }

                // 监控 dictionary 变化、同步下拉内容
                $scope.$watch("defaults.dictionary", function (dictionary) {
                    // 清空
                    treeModel.splice(0, treeModel.length);

                    treeModel.push(dictionary.root);

                    // 设置选中项
                    $scope.selectedNode = defaults.dictionary.hash[defaults.model[set.id]];
                    // 设置展开项
                    $scope.expandedNodes = $app.dictionary.parents(defaults.dictionary, defaults.model[set.id]);
                });

                // 查询
                $scope.$watch("defaults.filter.term", function (n, o) {
                    if (n != o) {
                        treeModel.splice(0, treeModel.length)
                        if (!n) {
                            treeModel.push(defaults.dictionary.root);
                        } else {
                            angular.forEach(defaults.dictionary.options, function (item) {
                                if (!item.children && item.text.indexOf(n) != -1) {
                                    treeModel.push(item)
                                }
                            })
                        }
                    }
                    if (treeModel.length == 0) {
                        treeModel.push({id: -9999, name: "未查询到可选项"});
                    }
                });

                // 监控 model 上 idField 字段的变化、重制默认选项
                $scope.$watch("defaults.model." + set[idField], function (nv) {
                    if (!nv) {
                        $placeholder.show();
                        $text.hide();
                    } else {
                        if (!multi) {
                            // 单选
                            if (defaults.dictionary.hash[nv]) {
                                $placeholder.hide();
                                $text.text(defaults.dictionary.hash[nv].path).show();
                            } else {
                                $placeholder.show();
                            }
                        }
                    }
                });

                $scope.onSelection = function (item, selected) {
                    if (!defaults.multi) {
                        // 单选
                        angular.forEach(set, function (key, value) {
                            defaults.model[key] = item[value];
                        })
                        if (angular.isFunction(defaults.select)) {
                            defaults.select(item, defaults.model);
                        }
                        $container.removeClass("open");
                    } else if (selected) {
                        // 多选
                    }
                }
                $scope.clear = function () {
                    $container.removeClass("open");
                    defaults.model[set[idField]] = "";
                    $scope.selectedNode = undefined;
                }
                $scope.submit = function () {
                    $container.removeClass("open");
                }

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