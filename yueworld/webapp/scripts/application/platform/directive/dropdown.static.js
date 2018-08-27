/**
 * dropdown.static.js
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
    $app.register.directive("ysPlatformDropdownStatic", [function () {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$q", "$element", "$attrs", "$timeout", function (_$scope, $q, $element, $attrs, $timeout) {
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
                        // 选中回调事件、参数：select(selectedItem、model)
                        select: angular.noop,
                        // 风格
                        theme: "default" /* default、caret */
                    }, $scope.$eval($attrs.ysPlatformDropdownStatic)),
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
                    defaultOption = [{}];
                defaultOption[0][idField] = -1;
                defaultOption[0][textField] = $app.valid.startsWith(placeholder, "-") ? placeholder : "请选择" + placeholder;
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
                if (multi) {
                    defaultOption = [];
                }
                // 数组
                if (angular.isArray(defaults.dictionary)) {
                    // 使用入参作为数据字典
                    $scope.$watch("defaults.dictionary", function () {
                        $scope.dictionary = $app.dictionary.build(defaultOption.concat(defaults.dictionary));
                    }, true);
                }
                // 字典
                else if (angular.isString(defaults.dictionary)) {
                    $scope.dictionary = $app.dictionary.build(defaultOption.concat($app.dictionary[defaults.dictionary] ? $app.dictionary[defaults.dictionary].options : []));
                }
                // 异常
                else {
                    $app.$($element).addClass("col-xs-12 ys-platform-pointer ys-platform-lh32 ys-platform-error").css({color: "red"}).text("-- Error：dictionary 类型错误！ --");
                    return;
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
                    if (angular.isArray(includes)) {
                        if (includes.length > 0) {
                            includes.push("-1");
                            options = options.filter(function (item) {
                                return includes.some(function (id) {
                                    return id == item.id;
                                })
                            })
                        }
                    } else if (angular.isFunction(includes)) {
                        options = options.filter(includes);
                    }
                    // 排除处理
                    if (angular.isArray(excludes)) {
                        if (excludes.length > 0) {
                            options = options.filter(function (item) {
                                return excludes.every(function (id) {
                                    return id != item.id;
                                })
                            })
                        }
                    } else if (angular.isFunction(excludes)) {
                        options = options.filter(function (option) {
                            return !excludes(option)
                        });
                    }

                    if (options.length == 1 && options[0].id == "-1") {
                        $tips.text("无相关数据").show()
                    } else if (options.length) {
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
                });


                function render() {
                    var selectedId = defaults.model[set[idField]],
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

                // 单选
                $options.on("click", ".single", function () {
                    var option = $app.$(this), data = option.data(), id = data[idField], text = data[textField];
                    $timeout(function () {
                        if (id != "-1") {
                            angular.forEach(set, function (key, value) {
                                defaults.model[key] = data[value];
                            })
                        } else {
                            // 清理数据
                            angular.forEach(set, function (key, value) {
                                delete defaults.model[key];
                            })
                            defaults.model[set[idField]] = "";
                        }
                        if (angular.isFunction(defaults.select)) {
                            defaults.select(data, defaults.model);
                        }
                        $container.removeClass("open");
                    });
                });

                // 多选
                $options.on("click", ".multi", function () {
                    var option = $app.$(this), data = option.data(), id = data[idField], ids = $app.helper.toArray(defaults.model[set.id]);
                    $timeout(function () {
                        if (option.hasClass("selected")) {
                            ids = ids.filter(function (old) {
                                return old != id;
                            })
                        } else {
                            ids.push(id);
                        }
                        defaults.model[set[idField]] = ids.join(",");
                        if (angular.isFunction(defaults.select)) {
                            defaults.select(ids, defaults.model);
                        }
                    });
                });

                // 移除多选项
                $title.on("click", "span.tag i", function ($event) {
                    $event.stopPropagation();
                    var data = $app.$($event.currentTarget).data(),
                        ids = $app.helper.toArray(defaults.model[set[idField]]).filter(function (id) {
                            return id != data[idField];
                        });
                    $timeout(function () {
                        defaults.model[set[idField]] = ids.join(",");
                        if (angular.isFunction(defaults.select)) {
                            defaults.select(ids, defaults.model);
                        }
                    })
                });
                $title.on("click", "span.tag", function ($event) {
                    $event.stopPropagation();
                });
                // 全选
                $body.on("click", "div.all", function ($event) {
                    $timeout(function () {
                        defaults.model[set[idField]] = $scope.dictionary.options.map(function (item) {
                            return item.id;
                        }).join(",");
                    })
                });
                // 清空
                $body.on("click", "div.qkxz", function ($event) {
                    $timeout(function () {
                        defaults.model[set[idField]] = undefined;
                    })
                });
                // 反选
                $body.on("click", "div.fx", function ($event) {
                    $timeout(function () {
                        var ids = $app.helper.toArray(defaults.model[set[idField]]);
                        defaults.model[set[idField]] = $scope.dictionary.options.filter(function (item) {
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