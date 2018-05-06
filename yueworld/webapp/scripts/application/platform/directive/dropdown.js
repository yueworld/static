/**
 * dropdown.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 动态下拉选择框
 */
// 引入样式
require("../views/dropdown.css");


/**
 * 动态数据字典
 * @param $app
 */
function _static($app) {
    var defaults = {
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
    }
    $app.directive("ysPlatformDropdownStatic", ["$q", "$compile", function ($q, $compile) {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$element", "$attrs", function (_$scope, $element, $attrs) {
                var $container = $app.$(require("../views/dropdown.html")),
                    $scope = _$scope.$new(),
                    option = $scope.option = angular.extend(defaults, $scope.$eval($attrs.ysPlatformDropdownStatic));

                // 默认提示
                option.placeholder = option.placeholder || (option.search ? "-- 请输入关键字 --" : "-- 请选择 --")

                // 必要参数检测
                if (!angular.isObject(option.set) || !option.set.id) {
                    $app.$($element).addClass("col-xs-12 pointer lh36 ys-platform-error").css({color: "red"}).text("-- Error：set.id 未定义！ --");
                    return;
                }
                if (angular.isString(option.dictionary)) {
                    $scope.dictionary = $app.dictionary.build([{
                        // 初始化一条默认记录、并copy 字典
                        text: option.placeholder, id: -1
                    }].concat($app.dictionary[option.dictionary] ? $app.dictionary[option.dictionary].options : []));
                } else if (angular.isArray(option.dictionary)) {
                    // 默认选项
                    $scope.dictionary = $app.dictionary.build(option.dictionary);
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
                    return item.id == option.model[option.set.id] || (!option.model[option.set.id] && item.id == '-1')
                }
                // 选中
                $scope.select = function (item) {
                    if (item.id != "-1") {
                        angular.forEach(option.set, function (key, value) {
                            option.model[key] = item[value];
                        })
                    } else {
                        clear();
                    }
                    if (angular.isFunction(option.select)) {
                        option.select(item, option.model);
                    }
                    option.filter.autoSearch = false;
                    $container.removeClass("open");
                    console.log(option.model)
                }
                if (option.theme == "caret") {
                    $container.addClass("theme-caret");
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


/**
 * 动态数据字典
 * @param $app
 */
function _dynamic($app) {
    var defaults = {
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
        // 级联刷新
        watchReload: {/* model: {}, property: ""*/},
        // 默认查询条件
        filter: {term: "" /*快速查询关键字*/, size: 6 /* 显示条数 */, autoSearch: true/*自动查询*/},
        // 开启查询
        search: false,
        // 默认宽度
        width: "100%",
        // 异步查询实现、可以是 Service 名称 例如 ProjectService -> project 、 StoreService -> store
        handler: function (filter, option) {
            var deferred = $app.injector.get("$q").defer();
            deferred.resolve([]);
            return deferred.promise;
        },
        // 选中回调事件、参数：select(selectedItem、model)
        select: angular.noop,
        theme: "default" /* default、caret */
    }
    $app.directive("ysPlatformDropdownDynamic", ["$q", "$compile", function ($q, $compile) {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$element", "$attrs", function (_$scope, $element, $attrs) {
                var $container = $app.$(require("../views/dropdown.html")),
                    $scope = _$scope.$new(),
                    option = $scope.option = angular.extend(defaults, $scope.$eval($attrs.ysPlatformDropdownDynamic)),
                    // 异步查询实现
                    handler = option.handler;
                // 加载中
                $scope.loading = true;

                // 默认选项
                $scope.dictionary = $app.dictionary.build([/*{id: -1, text: "-- 暂无可选项 --"}*/]);

                // 默认提示
                option.placeholder = option.placeholder || (option.search ? "-- 请输入关键字 --" : "-- 请选择 --")

                // 必要参数检测
                if (!angular.isObject(option.set) || !option.set.id) {
                    $app.$($element).addClass("col-xs-12 pointer lh36 ys-platform-error").css({color: "red"}).text("-- Error：set.id 未定义！ --");
                    return;
                }

                // 清理数据
                function clear() {
                    angular.forEach(option.set, function (key, value) {
                        delete option.model[key];
                    })
                }

                // 开启异步下啦框
                if (angular.isString(handler)) {
                    handler = $app.injector.get($app.helper.firstUpperCase(handler) + "Service").quick;
                }

                /**
                 * 加载数据
                 * @param filter 查询条件
                 */
                function refresh(filter, option) {
                    $scope.loading = true;
                    handler(filter, option).then(function ($response) {
                        if ($response.data && angular.isArray($response.data.data)) {
                            $response = $response.data.data;
                        } else if (angular.isArray($response.data)) {
                            $response = $response.data;
                        } else if (!angular.isArray($response)) {
                            $response = [];
                        }
                        if ($response.length != 0) {
                            $scope.dictionary = $app.dictionary.build([{
                                // 初始化一条默认记录、并copy 字典
                                text: option.placeholder, id: -1
                            }].concat($response));
                        }
                        $scope.loading = false;
                    })
                }

                // 快速搜索
                $scope.$watch("option.filter.term", $app.helper.watch(function (nv, ov) {
                    if (nv != ov && option.filter.autoSearch) {
                        refresh(option.filter, option);
                    }
                    option.filter.autoSearch = true;
                }, 180));
                if (!option.search) {
                    // 加载全量数据
                    refresh(option.filter, option);
                } else if (option.model[option.set.id]) {
                    // 根据条件 加载数据
                    refresh(angular.extend({id: option.model[option.set.id]}, option.filter), option);
                } else {
                    // 加载全量数据
                    refresh(option.filter, option);
                }
                // 及联刷新
                if (option.watchReload.property) {
                    $scope.$watch("option.watchReload.model." + option.watchReload.property, function (nv, ov) {
                        if (nv != ov) {
                            // 清理历史 设值
                            clear();
                            option.filter.term = "";
                            // 禁止自动载入数据
                            option.filter.autoSearch = false;
                            // 手动载入数据
                            refresh(option.filter, option);
                        }
                    })
                }
                // 是否选中
                $scope.active = function (item) {
                    return item.id == option.model[option.set.id] || (!option.model[option.set.id] && item.id == '-1')
                }
                // 选中
                $scope.select = function (item) {
                    if (item.id != "-1") {
                        angular.forEach(option.set, function (key, value) {
                            option.model[key] = item[value];
                        })
                    } else {
                        clear();
                    }
                    if (angular.isFunction(option.select)) {
                        option.select(item, option.model);
                    }
                    option.filter.autoSearch = false;
                    $container.removeClass("open");
                    console.log(option.model)
                }
                if (option.theme == "caret") {
                    $container.addClass("theme-caret");
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

module.exports = function ($app) {
    _static($app);
    _dynamic($app);
}