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
                    $container = $app.$(template).addClass(defaults.multi /* 多选 */ ? "multi" : "").addClass(defaults.theme == "caret" ? "theme-caret" : ""),
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
                    width = defaults.width ? defaults.width : (defaults.theme == "caret" ? "initial" : "100%"),
                    // 默认提示
                    placeholder = defaults.placeholder = defaults.placeholder || "-- 请选择 --",
                    defaultOption = {};
                defaultOption[idField] = -1;
                defaultOption[textField] = $app.valid.startsWith(placeholder, "-") ? placeholder : "请选择" + placeholder;
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
                    // 使用入参作为数据字典
                    $scope.$watch("defaults.dictionary", function () {
                        $scope.dictionary = $app.dictionary.build([defaultOption].concat(defaults.dictionary));
                    }, true);
                }
                // 字典
                else if (angular.isString(defaults.dictionary)) {
                    $scope.dictionary = $app.dictionary.build([defaultOption].concat($app.dictionary[defaults.dictionary] ? $app.dictionary[defaults.dictionary].options : []));
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
                        // 追加选项
                        options.forEach(function (item) {
                            var id = item[idField], text = item[textField],
                                option = $option.clone().data(item).addClass(id == -1 ? "ys-platform-text-invalid" : "").addClass(multi ? "ys-platform-checkbox multi" : "single");
                            // 非多选、或 多选情况下 id!=-1
                            if (!multi || multi && id != "-1") {
                                option.append(text);
                                $options.append(option);
                            }
                        })
                    }
                });

                // 监控 model 上 idField 字段的变化、重制默认选项
                $scope.$watch("defaults.model." + set[idField], function (nv) {
                    var options = $options.find(".option").removeClass("selected");
                    if (!nv) {
                        $tags.hide();
                        $text.hide();
                        $placeholder.show();
                    } else {
                        $placeholder.hide();
                        if (!multi) {
                            // 单选
                            $tags.hide();
                            $text.show();
                            options.each(function () {
                                var option = $app.$(this), data = option.data(), id = data[idField], text = data[textField];
                                // 单选
                                if (nv == data[idField]) {
                                    option.addClass("selected");
                                    $text.text(text);
                                }
                            });
                        } else {
                            // 多选
                            $text.hide();
                            $tags.show();
                            // 多选
                            var ids = $app.helper.toArray(nv);
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
                });

                // 清理数据
                function clear() {
                    angular.forEach(set, function (key, value) {
                        delete defaults.model[key];
                    })
                }

                // 单选
                $options.on("click", ".single", function () {
                    var option = $app.$(this), data = option.data(), id = data[idField], text = data[textField];
                    $timeout(function () {
                        if (id != "-1") {
                            angular.forEach(set, function (key, value) {
                                defaults.model[key] = data[value];
                            })
                        } else {
                            clear();
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
                $container.width(width).click(function ($event) {
                    $event.stopPropagation();
                });
                $element.append($container);
            }]
        };
    }]);
}