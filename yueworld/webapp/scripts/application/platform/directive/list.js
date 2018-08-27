// 引入样式
require("../views/list.scss");
module.exports = function ($app) {
    var template = require("../views/list.html"),
        headerHtml = '' +
            '<tr>' +
            '   <th ng-if="defaults.checkbox"></th>' +
            '   <th ng-if="column.if == undefined || column.if" ng-repeat="column in defaults.columns" ng-style="column.style" ng-class="column.class" ng-click="serverSortHandler(column)">' +
            '      <span ng-bind-html="column.name" ng-if="!column.checkbox"></span>' +
            '      <i style="cursor: pointer" ng-if="column.serverSortHandler" ys-platform-icon="{name:\'sort-asc\',width:12,height:36}"></i>' +
            '   </th>' +
            '</tr>',
        _trRs = $app.$("<tr class='ys-platform-pointer ys-platform-no-select' ng-class='{\"selected\":selectedItem==item}'></tr>"),
        _trDetail = $app.$("<tr class='detail'><td><div class='col-xs-12 ys-platform-list-form' ng-if='selectedItem==item'></div></td></tr>"),
        _td = $app.$("<td><span></span></td>"),
        isAsc = false;

    // 头
    function generateHeader($table) {
        $table.find("thead").empty().append(headerHtml);
    }

    // 体
    function generateBody(_$scope, $compile, $table, defaults) {
        var body = $table.find(">tbody").empty(), newItem = _trDetail.clone(), childScopes = body.data("childScopes");
        if (!childScopes) {
            body.data("childScopes", childScopes = []);
        } else {
            childScopes.forEach(function (scope) {
                scope.$destroy();
            })
            body.data("childScopes", childScopes = []);
        }
        if (defaults.detail) {
            newItem.find("td").attr("colspan", defaults.columns.length).find("div").attr(defaults.detail, "defaults.newItem").attr("ng-if", "selectedItem==defaults.newItem").css({display: "none"});
            body.append($compile(newItem)(_$scope));
        }
        if (defaults.pager.results) {
            angular.forEach(defaults.pager.results.sort(defaults.clientSortHandler), function (result) {
                var $scope = _$scope.$new(), rs = _trRs.clone();
                $scope.item = result;
                childScopes.push($scope);
                // 选择
                if (defaults.checkbox) {
                    var td = _td.clone().css({width: 43}).appendTo(rs),
                        span = td.find("span").addClass("ys-platform-checkbox").attr("ng-class", "{'selected':item.selected}").append("<i class='ys-platform-mr0'/>");
                    rs.append(td);
                }
                angular.forEach(defaults.columns, function (column) {
                    var td = _td.clone(), span = td.find("span");
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
                    if (column.if == undefined || column.if) {
                        rs.append(td);
                    }
                });
                // 选择
                rs.attr("ng-click", "trClick(item)");
                body.append($compile(rs)($scope));
                if (defaults.detail) {
                    var detail = _trDetail.clone();
                    detail.find("td").attr("colspan", defaults.checkbox ? defaults.columns.length + 1 : defaults.columns.length);
                    detail.find("div").attr(defaults.detail, "item").css({display: $scope.selectedItem == result ? "block" : "none"});
                    body.append($compile(detail)($scope));
                }
            })
        }
    }

    $app.register.directive("ysPlatformList", ["$q", "$timeout", function ($q, $timeout) {
        return {
            restrict: "A", replace: true,
            controller: ["$scope", "$compile", "$element", "$attrs", function (_$scope, $compile, $element, $attrs) {
                var $scope = _$scope.$new(),
                    defaults = $scope.defaults = angular.extend({
                        filter: {add: true},
                        // 字段
                        columns: [],
                        // 分页
                        pager: {},
                        pagerSupport: true,
                        // 无数据提示
                        noDataMessage: "暂无数据..."/*未查询到相关数据*/,
                        // 服务端排序
                        serverSortHandler: angular.noop,
                        // 客户端排序
                        clientSortHandler: angular.noop,
                        // 选中
                        selectHandler: angular.noop,
                        newItem: {},
                    }, _$scope.$eval($attrs.ysPlatformList)),
                    $container = $app.$(template), $table = $container.find("table");

                // 行选中
                $scope.trClick = function (item) {
                    if (defaults.detail) {
                        $scope.edit(item);
                    } else if (defaults.checkbox) {
                        // 选中状态
                        if (defaults.checkbox.radio) {
                            angular.forEach(defaults.pager.results, function (result) {
                                if (result.id == item.id) {
                                    item.selected = !item.selected;
                                } else {
                                    result.selected = false;
                                }
                            })
                        } else {
                            item.selected = !item.selected;
                        }
                    }
                    // 选择
                    defaults.selectHandler(item);
                }
                // 选中
                $scope.selectedItem = undefined;

                // 列头
                generateHeader($table);

                // 主体、响应结果集变化
                $scope.$watch("defaults.pager.results", function (nv, ov) {
                    generateBody($scope, $compile, $table, defaults);
                }, true);

                // 排序
                $scope.serverSortHandler = function (column) {
                    isAsc = column.isAsc = !isAsc
                    defaults.serverSortHandler(column);
                }

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
                            $app.event.publish(defaults.detail + ".down", {item: item});
                        })
                    }
                }

                // 新增
                $scope.$watch("defaults.filter.add", function (nv, ov) {
                    if (nv != ov) {
                        $scope.edit(defaults.newItem);
                        // $scope.edit($scope.selectedItem == defaults.newItem ? defaults.newItem : defaults.newItem = {});
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
                    var deferred = $q.defer(),
                        panels = $table.find(">tbody>tr>td>.ys-platform-list-form");
                    // 全部收起
                    panels.slideUp("fast", function () {
                        $timeout(function () {
                            deferred.resolve();
                            $app.event.publish(defaults.detail + ".up", {item: $scope.selectedItem});
                            $scope.selectedItem = undefined;
                        })
                    });
                    return deferred.promise;
                }

                $element.append($compile($container)($scope));

            }]
        };
    }]);
};