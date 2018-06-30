// 引入样式
require("../views/list.scss");
module.exports = function ($app) {
    var template = require("../views/list.html");
    $app.directive("ysPlatformList", [function () {
        return {
            restrict: "A", replace: true,
            controller: ["$scope", "$q", "$timeout", "$compile", "$element", "$attrs", function (_$scope, $q, $timeout, $compile, $element, $attrs) {
                var $scope = _$scope.$new(),
                    option = $scope.option = angular.extend({
                        // 字段
                        columns: [],
                        // 分页
                        pager: {},
                        pagerSupport: true,
                        // 选中
                        select: angular.noop,
                        // 无数据提示
                        noDataMessage: "暂无数据..."/*未查询到相关数据*/,
                        add: false,
                        filter: {add: true}
                    }, $scope.$eval($attrs.ysPlatformList)),
                    $container = $app.$($app.helper.template(template, {directive: option.detail})),
                    $table = $container.find("table"),
                    $tr = $table.find("tr.rs"),
                    newItem = $scope.newItem = {};

                // 当前选中条目
                $scope.selectedItem = undefined;

                angular.forEach(option.columns, function (column) {
                    var td = $app.$("<td><span></span></td>"), span = td.find("span");
                    if (column.style) {
                        td.attr("ng-style", angular.toJson(column.style));
                    }
                    if (column.class) {
                        if (angular.isObject(column.class)) {
                            td.attr("ng-class", angular.toJson(column.class));
                        } else {
                            td.attr("ng-class", column.class);
                        }
                    }
                    if (column.expr) {
                        span.attr({"ng-bind-html": column.expr});
                    } else if (column.field && column.dictionary) {
                        span.attr({"ng-bind-html": "$app.dictionary['" + column.dictionary + "'].hash[item['" + column.field + "']].text"});
                    } else if (column.field) {
                        span.attr("ng-bind-html", "item['" + column.field + "'] " + (column.filter ? "| " + column.filter : ""))
                    } else {
                        span.text("未定义")
                    }
                    $tr.append(td);
                })

                // 编辑
                $scope.edit = function (item) {
                    var panels = $table.find(">tbody>tr>td>.ys-platform-list-form");
                    // 存在展开的面板
                    if (panels.length > 0) {
                        // 全部收起
                        panels.slideUp("fast", function () {
                            $timeout(function () {
                                if ($scope.selectedItem == item) {
                                    $scope.selectedItem = undefined;
                                } else {
                                    $scope.selectedItem = undefined;
                                    $timeout(function () {
                                        $scope.edit(item);
                                    });
                                }
                            })
                        })
                    } else {
                        $scope.selectedItem = item;
                        // 展开
                        $timeout(function () {
                            $table.find(">tbody>tr>td>div.ys-platform-list-form").slideDown("fast");
                        })
                    }
                }

                // 新增
                $scope.$watch("option.filter.add", function (nv, ov) {
                    if (nv != ov) {
                        $scope.edit($scope.selectedItem == $scope.newItem ? $scope.newItem : $scope.newItem = {});
                    }
                });

                // 删除
                $scope.drop = function (service, message, input) {
                    service = $app.injector.get($app.helper.firstUpperCase(service) + "Service");
                    $app.assert.isTrue(!service, service + "Service" + "，服务未定义！");
                    $app.msgbox.confirm({message: message || "您正在删除信息<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                        if (result.execute) {
                            $app.loading(true);
                            service.drop(input.id).then(function ($response) {
                                try {
                                    var response = $response.data;
                                    if (response.success) {
                                        $scope.slideUp().then(function () {
                                            $scope.reload().then(function () {
                                                $app.tip.success({message: "操作完成"});
                                            });
                                        })
                                    } else {
                                        $app.msgbox.error({message: response.message});
                                        $app.loading(false);
                                    }
                                } catch (ex) {
                                    console.log(ex);
                                }
                            })
                        }
                    })
                }

                // 收起
                $scope.slideUp = function () {
                    var deferred = $q.defer();
                    var panels = $table.find(">tbody>tr>td>.ys-platform-list-form");
                    // 全部收起
                    panels.slideUp("fast", function () {
                        $timeout(function () {
                            $scope.selectedItem = undefined;
                            deferred.resolve();
                        })
                    })
                    return deferred.promise;
                }

                $container.addClass($element.attr("class"));
                $element.replaceWith($compile($container)($scope));
            }]
        };
    }]);
};