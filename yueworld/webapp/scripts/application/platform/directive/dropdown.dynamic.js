/**
 * dropdown.dynamic.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 动态下拉选择框
 */
// 引入样式
require("../views/dropdown.dynamic.scss");

module.exports = function ($app) {

    var template = require("../views/dropdown.dynamic.html"),
        $option = $app.$("<div class=\"option\"><i/></div>"),
        $tag = $app.$("<span class='tag'> <i class=\"svg-container\" style=\"width: 8px; height: 18px; display: inline-block;\"><svg style=\"width: 8px; height: 18px;\"><use xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#icon-close-1\" svg-href=\"close-1\"></use></svg></i></span>");

    /**
     * 动态数据字典
     */
    $app.register.directive("ysPlatformDropdownDynamic", [function () {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$q", "$compile", "$timeout", "$element", "$attrs", function (_$scope, $q, $compile, $timeout, $element, $attrs) {
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
                        // 数据字典
                        dictionary: [],
                        // 只包含、支持ID区分的字符串。
                        includes: [],
                        // 排除、支持ID区分的字符串。
                        excludes: [],
                        // 允许多选
                        multi: false,
                        // 默认宽度
                        width: undefined,
                        // 级联刷新
                        watchReload: {/* model: {}, property: ""*/},
                        // 默认查询条件
                        filter: {term: "" /*快速查询关键字*/, size: 6 /* 显示条数 */, autoSearch: true/*自动查询*/},
                        // 开启查询
                        search: false,
                        // 异步查询实现、可以是 Service 名称 例如 ProjectService -> project 、 StoreService -> store
                        handler: function (filter, defaults) {
                            var deferred = $app.injector.get("$q").defer();
                            deferred.resolve([]);
                            return deferred.promise;
                        },
                        // 选中回调事件、参数：select(selectedItem、model)
                        select: angular.noop,
                        theme: "default" /* default、caret */
                    }, $scope.$eval($attrs.ysPlatformDropdownDynamic)),

                    $container = $app.$(template).addClass(defaults.search ? "search" : "").addClass(defaults.multi /* 多选 */ ? "multi" : "").addClass(defaults.theme == "caret" ? "theme-caret" : "").width(defaults.width ? defaults.width : (defaults.theme == "caret" ? "initial" : "100%")),
                    $title = $container.find(".ys-platform-dropdown-title"),
                    $placeholder = $title.find(".placeholder"),
                    $text = $title.find(".text"),
                    $tags = $title.find(".tags"),
                    $body = $container.find(".ys-platform-dropdown-body"),
                    $tips = $body.find(".ys-platform-dropdown-body-tips"),
                    $loading = $body.find(".ys-platform-dropdown-body-loading"),
                    $search = $body.find(".ys-platform-dropdown-body-search"),
                    $input = $search.find("input"),
                    $options = $body.find(".ys-platform-dropdown-body-options"),
                    model = defaults.model = defaults.model ? defaults.model : {},
                    idField = defaults.idField,
                    textField = defaults.textField,
                    multi = defaults.multi,
                    set = defaults.set,
                    path = defaults.path,
                    includes = defaults.includes,
                    excludes = defaults.excludes,
                    // 异步查询实现
                    handler = defaults.handler,
                    // 默认提示
                    placeholder = defaults.placeholder = defaults.placeholder || "-- 请选择 --",
                    defaultOption = {};

                defaultOption[idField] = -1;
                defaultOption[textField] = $app.valid.startsWith(placeholder, "-") ? placeholder : "请选择" + placeholder;
                placeholder = defaults.placeholder = $app.valid.startsWith(placeholder, "-") ? placeholder : "所有" + placeholder;
                $placeholder.text(placeholder);

                // 默认选项
                $scope.dictionary = $app.dictionary.build([]);

                // 必要参数检测
                if (!angular.isObject(set) || !set.id) {
                    $app.$($element).addClass("col-xs-12 ys-platform-pointer ys-platform-lh32 ys-platform-error").css({color: "red"}).text("-- Error：set.id 未定义！ --");
                    return;
                }

                // 数据 Service Proxy
                if (angular.isString(handler)) {
                    handler = $app.injector.get($app.helper.firstUpperCase(handler) + "Service").quick;
                } else if (!angular.isFunction(handler)) {
                    $app.$($element).addClass("col-xs-12 ys-platform-pointer ys-platform-lh32 ys-platform-error").css({color: "red"}).text("-- Error：handler 类型错误！ --");
                    return;
                }

                // 加载数据
                function refresh(filter, defaults) {
                    $loading.show();
                    handler(filter, defaults).then(function ($response) {
                        if ($response.data && angular.isArray($response.data.data)) {
                            $response = $response.data.data;
                        } else if (angular.isArray($response.data)) {
                            $response = $response.data;
                        } else if (!angular.isArray($response)) {
                            $response = [];
                        }
                        if ($response.length != 0) {
                            $scope.dictionary = $app.dictionary.build([defaultOption].concat($response));
                        } else {
                            $scope.dictionary = $app.dictionary.build([defaultOption]);
                        }
                    }).finally(function () {
                        $loading.hide();
                    })
                }

                if (!defaults.search) {
                    // 加载全量数据
                    refresh(defaults.filter, defaults);
                } else if (model[set.id]) {
                    // 根据条件 加载数据
                    refresh(angular.extend({id: model[set.id]}, defaults.filter), defaults);
                } else {
                    // 加载全量数据
                    refresh(defaults.filter, defaults);
                }
                // 及联刷新
                if (defaults.watchReload.property) {
                    $scope.$watch("defaults.watchReload.model." + defaults.watchReload.property, function (nv, ov) {
                        if (nv != ov) {
                            // 清理数据
                            angular.forEach(set, function (key, value) {
                                delete model[key];
                            });
                            // 同步过滤条件
                            defaults.filter = angular.extend(defaults.filter, $scope.$eval($attrs.ysPlatformDropdownDynamic).filter);
                            // 清空查询关键字
                            defaults.filter.term = "";
                            // 禁止自动载入数据
                            defaults.filter.autoSearch = false;
                            // 手动载入数据
                            refresh(defaults.filter, defaults);
                        }
                    })
                }

                // 过滤
                // 包含
                includes = !includes ? [] : (angular.isString(includes) ? includes.split(",") : includes);
                // 排除
                excludes = !excludes ? [] : (angular.isString(excludes) ? excludes.split(",") : excludes);

                // 监控 dictionary 变化、同步下拉内容
                $scope.$watch("dictionary", function (dictionary) {
                    var options = dictionary.options;
                    $options.empty();
                    // 包含处理
                    if (includes.length > 0) {
                        includes.push("-1");
                        options = options.filter(function (item) {
                            return includes.some(function (id) {
                                return id == item.id;
                            })
                        })
                    }
                    // 排除处理
                    if (excludes.length > 0) {
                        options = options.filter(function (item) {
                            return excludes.every(function (id) {
                                return id != item.id;
                            })
                        })
                    }

                    if (options.length == 1 && options[0].id == "-1") {
                        $tips.text("无相关数据").show()
                    } else if (options.length) {
                        $tips.hide()
                        // 追加选项
                        options.forEach(function (item) {
                            var id = item[idField];
                            $option.clone()
                                .attr("id", id)
                                .data(item)
                                .addClass(id == -1 ? "ys-platform-text-invalid" : "")
                                .addClass(multi ? "ys-platform-checkbox multi" : "single")
                                .append(item[textField])
                                .appendTo($options);
                        })
                    }
                    render();
                }, true);


                function render() {
                    var selectedId = model[set[idField]],
                        options = $options.find(".option").removeClass("selected");
                    if (!selectedId || !options.length) {
                        $tags.hide();
                        $text.hide();
                        $placeholder.show();
                        $body.css({top: 34})
                    } else {
                        $placeholder.hide();
                        if (!multi) {
                            // 单选
                            $tags.hide();
                            $text.show();
                            options = options.filter("[id='" + (selectedId ? selectedId : "--") + "']");
                            options.addClass("selected");
                            $text.text(options.eq(0).data().text);
                        } else {
                            // 多选
                            $text.hide();
                            $tags.show();
                            // 多选
                            var ids = $app.helper.toArray(selectedId);
                            if (ids.length) {
                                $tags.empty().show();
                                options.each(function () {
                                    var option = $app.$(this), data = option.data(), tag = undefined;
                                    if (ids.some(function (id) {
                                            return id == data[idField];
                                        })) {
                                        option.addClass("selected");
                                        tag = $tag.clone();
                                        tag.prepend(data[textField]);
                                        tag.find("i").data(data);
                                        $tags.append(tag);
                                    } else {
                                        option.removeClass("selected")
                                    }
                                });
                            }
                            $body.css({top: $title.height() + 4})
                        }
                    }
                }

                // 监控 model 上 idField 字段的变化、重制默认选项
                $scope.$watch("defaults.model." + set[idField], render);

                var timer = 0;
                $input.keyup(function () {
                    defaults.filter.term = $input.val();
                    // 快速搜索
                    $timeout.cancel(timer);
                    timer = $timeout(function () {
                        refresh(defaults.filter, defaults);
                    }, 160);
                });

                // 单选
                $options.on("click", ".single", function () {
                    var option = $app.$(this), data = option.data(), id = data[idField], text = data[textField];
                    $timeout(function () {
                        if (id != "-1") {
                            angular.forEach(set, function (key, value) {
                                model[key] = data[value];
                            })
                        } else {
                            // 清理数据
                            angular.forEach(set, function (key, value) {
                                delete model[key];
                            })
                            model[set[idField]] = "";
                        }
                        if (angular.isFunction(defaults.select)) {
                            defaults.select(data, model);
                        }
                        $container.removeClass("open");
                    });
                });

                // 多选
                $options.on("click", ".multi", function () {
                    var option = $app.$(this), data = option.data(), id = data[idField], ids = $app.helper.toArray(model[set.id]);
                    $timeout(function () {
                        if (option.hasClass("selected")) {
                            ids = ids.filter(function (old) {
                                return old != id;
                            })
                        } else {
                            ids.push(id);
                        }
                        model[set[idField]] = ids.join(",");
                        if (angular.isFunction(defaults.select)) {
                            defaults.select(ids, model);
                        }
                    });
                });

                // 移除多选项
                $title.on("click", "span.tag i", function ($event) {
                    $event.stopPropagation();
                    var data = $app.$($event.currentTarget).data(),
                        ids = $app.helper.toArray(model[set[idField]]).filter(function (id) {
                            return id != data[idField];
                        });
                    $timeout(function () {
                        model[set[idField]] = ids.join(",");
                        if (angular.isFunction(defaults.select)) {
                            defaults.select(ids, model);
                        }
                    })
                });
                $title.on("click", "span.tag", function ($event) {
                    $event.stopPropagation();
                });
                // 全选
                $body.on("click", "div.all", function ($event) {
                    $timeout(function () {
                        model[set[idField]] = $scope.dictionary.options.map(function (item) {
                            return item.id;
                        }).join(",");
                    })
                });
                // 清空
                $body.on("click", "div.qkxz", function ($event) {
                    $timeout(function () {
                        model[set[idField]] = undefined;
                    })
                });
                // 反选
                $body.on("click", "div.fx", function ($event) {
                    $timeout(function () {
                        var ids = $app.helper.toArray(model[set[idField]]);
                        model[set[idField]] = $scope.dictionary.options.filter(function (item) {
                            return !ids.some(function (id) {
                                return id == item.id;
                            });
                        }).map(function (item) {
                            return item.id;
                        }).join(",");
                    })
                });

                // 显示 与 隐藏 dropdown
                $title.click(function () {
                    var parentDropdown = $container.parents(".ys-platform-dropdown");
                    $app.$(".ys-platform-dropdown").not(function () {
                        var dropdown = $app.$(this);
                        // 防止干掉 拥有子父关系的 Dropdown
                        return dropdown.is($container) || dropdown.is(parentDropdown);
                    }).removeClass("open");
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
                $element.append($container);
            }]
        };
    }]);

}