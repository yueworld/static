/**
 * dropdown.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 下拉选择框
 */
module.exports = function ($app) {

    // 加载样式
    require("../views/dropdown.tree.css");
    /**
     * 数据字典、自动查询
     *
     * ys-framework-dropdown={modal:input,property:{id:'projectId',text:'projectName'}|'',...}
     *
     */
    $app.directive("ysFrameworkDropdownTree", ["$timeout", function ($timeout) {
        return {
            controller: ["$scope", "$q", "$compile", "$element", "$attrs", function (_$scope, $q, $compile, $element, $attrs) {
                var $container = $app.$(require("../views/dropdown.tree.html")),
                    $scope = _$scope.$new(),
                    option = $scope.option = angular.extend({
                        // 字典名称
                        dictionary: "",
                        // 模型
                        model: undefined,
                        // 操作属性
                        property: undefined /* 支持 {dictionaryProperty:"modelProperty"} */,
                        // 开启查询
                        search: false,
                        // 异步加载
                        async: false,
                        // 加载条数
                        size: 6,
                        width: "auto",
                        // 及联刷新。示例：当前为楼层选择框、模型的 projectId 属性发生 变动时 自动 重新执行 handler 逻辑
                        watchReloadProperty: '',
                        // 异步查询实现、可以是 Service 名称 例如 ProjectService -> project 、 StoreService -> store
                        handler: function (filter) {
                            return $q.defer().promise;
                        },
                        // 选中以后的回掉事件、参数：select(selectedItem、model)
                        select: angular.noop,
                        theme: "default" /* default、caret */
                    }, $scope.$eval($attrs.ysFrameworkDropdownTree)),
                    property = option.property,
                    // 如果 property 为 object 需要做特殊处理
                    isObjectToProperty = $scope.isObjectToProperty = angular.isObject(property),
                    // 启用异步查询
                    async = option.async,
                    // 过滤条件
                    filter = $scope.filter = {term: "", dq/*不进行查询*/: false},
                    // 异步查询实现
                    handler = option.handler,
                    // 数据字典（可以是静态 或 异步加载过来的 ）
                    dictionary = undefined;
                // 默认提示
                option.placeholder = option.placeholder || (option.search ? "-- 请输入关键字 --" : "-- 请选择 --")
                // 必要参数检测
                if (isObjectToProperty && (!property.id || !property.text)) {
                    $app.$($element).addClass("col-xs-12 pointer lh36").css({color: "red"}).text("-- Error：Object Property 格式错误！ --");
                    $app.tip.error({message: "ysFrameworkDropdown Init Error: 对象型  id、text 字段不能为空！"})
                    return;
                }
                // 清理数据
                function clear() {
                    if (isObjectToProperty) {
                        angular.forEach(property, function (key, value) {
                            option.model[key] = "";
                        })
                    } else {
                        option.model[property] = "";
                    }
                }

                if (async) {
                    // 开启异步下啦框
                    if (angular.isString(handler)) {
                        handler = $app.injector.get($app.data.firstUpperCase(handler) + "Service").quick;
                    }

                    // 刷新/加载数据
                    function refresh(filter) {
                        handler(angular.extend({size: option.size}, filter)).then(function ($response) {
                            dictionary = $scope.dictionary = $app.dictionary.build([{
                                // 初始化一条默认记录、并copy 字典
                                text: option.placeholder, id: -1
                            }].concat($response.data.data));
                        })
                    }

                    // 快速搜索
                    $scope.$watch("filter.term", $app.watch(function (nv, ov) {
                        if (nv != ov && !filter.dq) {
                            refresh(filter);
                        } else {
                            filter.dq = false;
                        }
                    }, 180));
                    if (!option.search) {
                        refresh(filter);
                    } else if (isObjectToProperty) {
                        if (option.model[property.id]) {
                            refresh(angular.extend({id: option.model[property.id]}, filter));
                        }
                    } else if (option.model[property]) {
                        refresh(angular.extend({id: option.model[property]}, filter));
                    }
                    // 及联刷新
                    if (option.watchReloadProperty) {
                        var watchProperty = angular.isObject(option.watchReloadProperty) ? "option.watchReloadProperty.model." + option.watchReloadProperty.property : "option.model." + option.watchReloadProperty;
                        $scope.$watch(watchProperty, function (nv, ov) {
                            if (nv != ov) {
                                // 清理历史 设值
                                clear();
                                filter.term = "";
                                // 禁止自动载入数据
                                filter.dq = true;
                                // 手动载入数据
                                refresh(filter);
                            }
                        })
                    }
                } else {
                    if (angular.isString(option.dictionary)) {
                        // 开启本地字典项 ($app.dictionary.xxx) 下拉框
                        dictionary = $scope.dictionary = $app.dictionary.build([{
                            // 初始化一条默认记录、并copy 字典
                            text: option.placeholder, id: -1
                        }].concat($app.dictionary[option.dictionary] ? $app.dictionary[option.dictionary].options : []));
                    } else if (angular.isArray(option.dictionary)) {
                        // 开启本地字典项 ($app.dictionary.xxx) 下拉框
                        function refresh() {
                            dictionary = $scope.dictionary = $app.dictionary.build([{
                                // 初始化一条默认记录、并copy 字典
                                text: option.placeholder, id: -1
                            }].concat(option.dictionary));
                        }

                        $scope.$watch("option.dictionary", refresh, true);
                    } else {
                        $app.tip.error({message: "ysFrameworkDropdown Init Error: dictionary 类型错误！"})
                        return;
                    }

                    $scope.trees = [$app.dictionary.LAYOUTS.root];
                    $scope.expandedNodes = [$scope.trees[0]];
                    $scope.selectedNode = $scope.trees[0];
                }
                // 是否选中
                $scope.active = function (item) {
                    if (isObjectToProperty) {
                        return item.id == option.model[option.property.id] || (!option.model[option.property.id] && item.id == '-1')
                    } else {
                        return item.id == option.model[option.property] || (!option.model[option.property] && item.id == '-1');
                    }
                }
                // 选中
                $scope.select = function (item) {
                    if (item.id != "-1") {
                        if (isObjectToProperty) {
                            angular.forEach(property, function (key, value) {
                                option.model[key] = item[value];
                            })
                        } else {
                            option.model[property] = item.id;
                        }
                    } else {
                        clear();
                    }
                    if (angular.isFunction(option.select)) {
                        option.select(item, option.model);
                    }
                    filter.dq = true;
                    $container.removeClass("open");
                }
                if (option.theme == "caret") {
                    $container.addClass("theme-caret");
                }
                // 显示 与 隐藏 dropdown
                $container.on("click", ".ys-framework-dropdown-tree-toggle", function () {
                    $app.$("div.ys-framework-dropdown-tree").not($container).removeClass("open")
                    $container.toggleClass("open");
                    if ($container.hasClass("open")) {
                        $container.find(".ys-framework-dropdown-tree-search input").trigger("focus");
                        $app.el.body.one("click", function () {
                            $container.removeClass("open");
                        })
                    }
                });
                $container.find("input.ys-framework-dropdown-tree-text").width(option.width);
                $element.append($compile($container)($scope));
            }],
            restrict: "A", replace: true, transclude: true
        };
    }]);
}