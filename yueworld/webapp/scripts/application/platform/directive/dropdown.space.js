/**
 * dropdown.tenant.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 空间选择
 */
// 引入样式
require("../views/dropdown.space.scss");

module.exports = function ($app) {
    var template = require("../views/dropdown.space.html"),
        error = "<div class='ys-platform-dropdown ys-platform-error ys-platform-w100'><div class='ys-platform-dropdown-title'><div class='text ys-platform-text-danger'></div></div></div>",
        $tag = $app.$("<span class='tag'> <i class=\"svg-container\" style=\"width: 8px; height: 18px; display: inline-block;\"><svg style=\"width: 8px; height: 18px;\"><use xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#icon-close-1\" svg-href=\"close-1\"></use></svg></i></span>");
    /**
     * 空间选择
     */
    $app.register.directive("ysPlatformDropdownSpace", [function () {
        return {
            restrict: "A", replace: true, transclude: true,
            controller: ["$scope", "$q", "$compile", "$element", "$attrs", "$timeout", function (_$scope, $q, $compile, element, $attrs, $timeout) {
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
                        // 级联刷新
                        watchReload: {/* model: {}, property: ""*/},
                        // 默认查询条件
                        filter: {term: "", size: 6},
                        // 选中回调事件、参数：select(ids,defaults)
                        select: angular.noop,
                        // 主题
                        theme: "default" /* default、caret */
                    }, $scope.$eval($attrs.ysPlatformDropdownSpace)),
                    $element = $app.$(element),
                    $container = $app.$(template).addClass(defaults.multi /* 多选 */ ? "multi" : "").addClass(defaults.theme == "caret" ? "theme-caret" : "").width(defaults.width ? defaults.width : (defaults.theme == "caret" ? "initial" : "100%")),
                    $title = $container.find(".ys-platform-dropdown-title"),
                    $placeholder = $title.find(".placeholder"),
                    $text = $title.find(".text"),
                    $tags = $title.find(".tags"),
                    $body = $container.find(".ys-platform-dropdown-body"),
                    $tips = $body.find(".ys-platform-dropdown-body-tips"),
                    $input = $body.find(".ys-platform-dropdown-body-search input"),
                    idField = defaults.idField,
                    textField = defaults.textField,
                    multi = defaults.multi,
                    set = defaults.set,
                    path = defaults.path,
                    includes = defaults.includes,
                    excludes = defaults.excludes,
                    filter = defaults.filter,
                    // 默认提示
                    placeholder = defaults.placeholder = defaults.placeholder || "-- 请选择 --",
                    defaultOption = {},
                    // 当前项目下全部空间
                    spaces = angular.copy($app.dictionary.SPACES.options.filter(function (space) {
                        return space.projectId == filter.projectId;
                    })),
                    // 已选记录
                    selectdItems = defaults.selectdItems = $scope.selectdItems = [];
                // set
                defaultOption[idField] = -1;
                defaultOption[textField] = $app.valid.startsWith(placeholder, "-") ? placeholder : "请选择" + placeholder;
                placeholder = defaults.placeholder = $app.valid.startsWith(placeholder, "-") ? placeholder : "所有" + placeholder;
                $placeholder.text(placeholder);

                function setErrorMessage(message) {
                    $app.$(error).appendTo($element).find(".text").text(message);
                }

                // 必要参数检测
                if (!angular.isObject(set) || !set.id) {
                    setErrorMessage("-- Error：set.id 未定义！ --");
                    return;
                }
                if (multi) {
                    defaultOption = [];
                }
                // 过滤
                // 包含
                includes = !includes ? [] : (angular.isString(includes) ? includes.split(",") : includes);
                // 排除
                excludes = !excludes ? [] : (angular.isString(excludes) ? excludes.split(",") : excludes);

                // 及联刷新
                if (defaults.watchReload.property) {
                    $scope.$watch("defaults.watchReload.model." + defaults.watchReload.property, function (nv, ov) {
                        if (nv != ov) {
                            // 清理数据
                            angular.forEach(set, function (key, value) {
                                delete defaults.model[key];
                            });
                            // 同步过滤条件
                            defaults.filter = angular.extend(defaults.filter, $scope.$eval($attrs.ysPlatformDropdownSpace).filter);
                            // 清空查询关键字
                            defaults.filter.term = "";
                            // 重置
                            $scope.reset();
                            // 当前项目下全部空间
                            spaces = angular.copy($app.dictionary.SPACES.options.filter(function (space) {
                                return space.projectId == filter.projectId;
                            }));
                        }
                    })
                }


                // 加载楼栋
                $scope.queryBuildingHandler = function () {
                    return $app.helper.promise(function () {
                        return $app.dictionary.BUILDINGS.options.filter(function (building) {
                            return building.projectId == filter.projectId;
                        })
                    });
                }
                // 楼栋切换
                $scope.$watch("defaults.filter.buildingId", function () {
                    $scope.floors = angular.copy($app.dictionary.FLOORS.options.filter(function (floor) {
                        return floor.buildingId == filter.buildingId;
                    }));
                    filter.floorId = undefined;
                    $scope.spaces = [];
                });
                // 楼层切换
                $scope.$watch("defaults.filter.floorId", function () {
                    var ids = $app.helper.toArray(defaults.model[set.id]);
                    $scope.spaces = angular.copy(spaces.filter(function (space) {
                        return space.floorId == filter.floorId;
                    }));
                    $scope.spaces.forEach(function (space) {
                        if (ids.some(function (id) {
                                return id == space.id;
                            })) {
                            space.selected = true;
                        }
                    });
                });
                // 选择空间
                $scope.select = function (space) {
                    var ids = $app.helper.toArray(defaults.model[set.id]);
                    if (!multi) {
                        // 单选 清空
                        ids = [space.id];
                    } else {
                        if (space.selected) {
                            ids = ids.filter(function (id) {
                                return id != space.id;
                            })
                        } else {
                            ids.push(space.id);
                        }
                        space.selected = !space.selected;
                    }
                    defaults.model[set[idField]] = ids.join(",");
                }
                // 删除已选
                $scope.drop = function (space) {
                    var ids = $app.helper.toArray(defaults.model[set.id]).filter(function (id) {
                        return id != space.id;
                    });
                    defaults.model[set[idField]] = ids.join(",");
                }
                // 重置
                $scope.reset = function () {
                    filter.buildingId = filter.floorId = undefined;
                    $scope.floors = $scope.spaces = [];
                }
                // 监控 model 上 idField 字段的变化、重制默认选项
                $scope.$watch("defaults.model." + set[idField], function (nv) {
                    var ids = $app.helper.toArray(nv),
                        selectdItems = defaults.selectdItems = $scope.selectdItems = spaces.filter(function (space) {
                            return ids.some(function (id) {
                                return id == space.id;
                            })
                        });
                    // 同步空间选中状态
                    $scope.spaces.forEach(function (space) {
                        space.selected = false;
                        if (ids.some(function (id) {
                                return id == space.id;
                            })) {
                            space.selected = true;
                        }
                    });
                    if (!nv || selectdItems.length == 0) {
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
                            $text.text(selectdItems[0].text);
                        } else {
                            // 多选
                            $text.hide();
                            $tags.show();
                            var ids = $app.helper.toArray(nv);
                            if (ids.length) {
                                $tags.empty().show();
                                selectdItems.forEach(function (item) {
                                    $tag.clone().prepend(item.text).appendTo($tags).find("i").data(item);
                                });
                            }
                            $body.css({top: $title.height() + 4})
                        }
                    }
                    // 触发回调
                    if (angular.isFunction(defaults.select)) {
                        defaults.select(ids.join(","), defaults);
                    }
                });

                // 清空
                $scope.clear = function () {
                    $container.removeClass("open");
                    defaults.model[set[idField]] = "";
                }

                // 关闭
                $scope.close = function () {
                    $container.removeClass("open");
                }

                $scope.$watch("defaults.filter.term", function (n, o) {
                    // 重置查询
                    $scope.reset();
                    if (n != o && n) {
                        var ids = $app.helper.toArray(defaults.model[set[idField]]), _space = undefined;
                        $scope.spaces = []
                        angular.forEach(spaces, function (space) {
                            if (space.text.indexOf(n) != -1) {
                                _space = angular.copy(space);
                                if (ids.indexOf(_space.id) != -1) {
                                    _space.selected = true;
                                }
                                $scope.spaces.push(_space);
                            }
                        })
                    }
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

                    })
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