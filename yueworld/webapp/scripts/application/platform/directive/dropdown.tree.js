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
                            return item.id != -9999;
                        }
                    }, $scope.$eval($attrs.ysPlatformDropdownTree)),
                    treeOptions = $scope.treeOptions = {
                        nodeChildren: "children",
                        // 能否选择目录
                        dirSelectable: option.dirSelectable,
                        // 是否可以多选
                        multiSelection: option.multi,
                        // 允许取消选择
                        allowDeselect: option.allowDeselect,
                        // 是否允许选择
                        isSelectable: option.isSelectable,
                        injectClasses: {/*  ul: "a1",li: "a2",liSelected: "a7",iExpanded: "a3",iCollapsed: "a4",iLeaf: "a5",label: "a6",labelSelected: "a8"*/}
                    },
                    treeModel = $scope.treeModel = [],
                    // 默认提示
                    placeholder = option.placeholder = option.placeholder || "-- 请选择 --",
                    placeholder = option.placeholder = $app.valid.startsWith(placeholder, "-") ? placeholder : "所有" + placeholder;
                // 测试数据
                if (angular.isArray(option.dictionary) && option.dictionary.length == 0) {
                    option.dictionary.push({id: -1, name: "全部业态"});
                    option.dictionary.push({id: 1003, name: "中餐", parentId: -1});
                    option.dictionary.push({id: 10031, name: "粤菜", parentId: 1003});
                    option.dictionary.push({id: 10032, name: "茶餐厅", parentId: 1003});
                    option.dictionary.push({id: 10033, name: "川菜", parentId: 1003});
                    option.dictionary.push({id: 100331, name: "重庆小面", parentId: 10033});
                }
                // option.dictionary.push({id: 1005, name: "日料", parentId: -1});
                if (!option.dictionary.length) {
                    option.dictionary.push({id: -1, name: "未添加任何可选项！"})
                }

                if (angular.isString(option.dictionary)) {
                    option.dictionary = $app.dictionary[option.dictionary];
                } else if (angular.isArray(option.dictionary)) {
                    // 使用入参作为数据字典
                    /*$scope.$watch("option.dictionary", function () {
                        $scope.dictionary = $app.dictionary.build(option.dictionary, true);
                        console.log(1)
                    }, true);*/
                    option.dictionary = $app.dictionary.build(option.dictionary, true);
                    // console.log(2)
                    /*if (angular.isArray(option.dictionary)) {
                        option.dictionary = $app.dictionary.build(option.dictionary, true);
                    }*/
                } else {
                    $app.$($element).addClass("col-xs-12 pointer lh36 ys-platform-error").css({color: "red"}).text("-- Error：dictionary 类型错误！ --");
                    return;
                }
                treeModel.push(option.dictionary.root);
                // 设置选中项
                $scope.selectedNode = option.dictionary.hash[option.model[option.set.id]];
                // 设置展开项
                $scope.expandedNodes = $app.dictionary.parents(option.dictionary, option.model[option.set.id]);

                // 查询
                $scope.$watch("option.filter.term", function (n, o) {
                    if (n != o) {
                        treeModel.splice(0, treeModel.length)
                        if (!n) {
                            treeModel.push(option.dictionary.root);
                        } else {
                            angular.forEach(option.dictionary.options, function (item) {
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

                // 清理数据
                function clear() {
                    angular.forEach(option.set, function (key, value) {
                        delete option.model[key];
                    })
                }

                // 选中
                $scope.select = function (item) {
                    /*if (item[option.idField] != "-1") {
                        angular.forEach(option.set, function (key, value) {
                            option.model[key] = item[value];
                        })
                    } else {
                        clear();
                        option.model[option.set[option.idField]] = "";

                    }*/
                    angular.forEach(option.set, function (key, value) {
                        option.model[key] = item[value];
                    })
                    if (angular.isFunction(option.select)) {
                        option.select(item, option.model);
                    }
                    $container.removeClass("open");
                }
                $scope.onSelection = function (item, selected) {
                    if (!option.multi) {
                        $scope.select(item);
                    } else if (selected) {

                    }
                }
                $scope.cancel = function () {
                    $container.removeClass("open");
                }
                $scope.submit = function () {
                    $container.removeClass("open");
                }
                if (option.theme == "caret") {
                    $container.addClass("theme-caret");
                    option.width = "initial";
                }
                // 显示 与 隐藏 dropdown
                $container.on("click", ".ys-platform-dropdown-toggle", function () {
                    $app.$("div.ys-platform-dropdown").not($container).removeClass("open")
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