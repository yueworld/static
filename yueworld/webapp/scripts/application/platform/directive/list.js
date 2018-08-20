// 引入样式
require("../views/list.scss");
module.exports = function ($app) {
    var template = require("../views/list.html"),
        headerHtml = '' +
            '<tr>' +
            '   <th ng-if="column.if == undefined || column.if" ng-repeat="column in option.columns" ng-style="column.style" ng-class="column.class" ng-click="sortHandler(column)">' +
            '      <span ng-bind-html="column.name"></span>' +
            '      <i style="cursor: pointer" ng-if="column.sort" ys-platform-icon="{name:\'sort-asc\',width:12,height:36}"></i>' +
            '   </th>' +
            '</tr>',
        _trRs = $app.$("<tr class='rs ys-platform-pointer' ng-click='option.detail&&edit(item)' ng-class='{\"selected\":selectedItem==item}'></tr>"),
        _trDetail = $app.$("<tr class='detail'><td><div class='col-xs-12 ys-platform-list-form' style='display: none' ng-if='selectedItem==item'></div></td></tr>"),
        _td = $app.$("<td><span></span></td>"),
        isAsc = false;

    // 头
    function generateHeader($table) {
        $table.find("thead").empty().append(headerHtml);
    }

    // 体
    function generateBody(_$scope, $compile, $table, option) {
        var body = $table.find("tbody").empty(), newItem = _trDetail.clone();
        if (option.detail) {
            newItem.find("td").attr("colspan", option.columns.length).find("div").attr(option.detail, "newItem").attr("ng-if", "selectedItem==newItem");
            body.append($compile(newItem)(_$scope));
        }
        angular.forEach(option.pager.results, function (result) {
            var $scope = angular.extend(_$scope.$new(), {item: result}), rs = _trRs.clone(), detail = _trDetail.clone();
            angular.forEach(option.columns, function (column) {
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
            detail.find("td").attr("colspan", option.columns.length);
            if (option.detail) {
                detail.find("div").attr(option.detail, "item");
            }
            if (option.click) {
                rs.attr("ng-click", option.click);
            }
            body.append($compile(rs)($scope));
            body.append($compile(detail)($scope));
        })
        body.append("")
    }

    function transformTable($timeout, table) {
        angular.element(table.querySelectorAll('thead, tbody')).css({'display': '', position: "initial"});
        $timeout(function () {
            // set widths of columns
            angular.forEach(table.querySelectorAll('tr:first-child th'), function (thElem, i) {
                var tdElems = table.querySelector('tbody tr:first-child td:nth-child(' + (i + 1) + ')');
                var columnWidth = tdElems ? tdElems.offsetWidth : tdElems.offsetWidth;
                if (tdElems) {
                    tdElems.style.width = columnWidth + 'px';
                }
                if (thElem) {
                    thElem.style.width = columnWidth + 'px';
                }
            });
            angular.element(table.querySelectorAll('tbody')).css({
                'display': 'block', 'height': 'inherit', 'overflow': 'auto'
            });
            angular.element(table.querySelectorAll('thead')).css({
                display: 'block', /*position: "fixed",*/ "z-index": 100
            });
        });
    }

    $app.register.directive("ysPlatformList", ["$q", "$timeout", function ($q, $timeout) {
        return {
            restrict: "A", replace: true,
            controller: ["$scope", "$compile", "$element", "$attrs", function (_$scope, $compile, $element, $attrs) {
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
                        filter: {add: true},
                        sortHandler: angular.noop,
                        full: true
                    }, $scope.$eval($attrs.ysPlatformList)),
                    $container = $app.$(template), $table = $container.find("table"), $tr = $table.find("tr.rs"),
                    newItem = $scope.newItem = {};

                // 排序
                $scope.sortHandler = function (column) {
                    isAsc = column.isAsc = !isAsc
                    option.sortHandler(column);
                }

                // 选中
                $scope.selectedItem = undefined;

                // 列头
                generateHeader($table);

                // 主体、响应结果集变化
                $scope.$watch("option.pager.results", function (nv, ov) {
                    generateBody($scope, $compile, $table, option);
                });

                // 编辑
                $scope.edit = function (item) {
                    var panels = $table.find(">tbody>tr>td>.ys-platform-list-form");
                    // 存在展开的面板
                    if (panels.length > 0) {
                        // 全部收起
                        // $table.find(">tbody").height("initial");
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
                            //  $table.find(">tbody").height($app.window.height()-270);
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

                $element.append($compile($container)($scope));

            }], _link: function ($scope, $elem) {
                var elem = $elem.find("table")[0];
                $scope.$watch(function tableDataLoaded() {
                    var firstCell = elem.querySelector('tbody tr:first-child td:first-child');
                    return firstCell && !firstCell.style.width;
                }, function (isTableDataLoaded) {
                    if (isTableDataLoaded) {
                        $timeout(function () {
                            angular.forEach(elem.querySelectorAll('tr:first-child th'), function (thElem, i) {
                                var tdElems = elem.querySelector('tbody tr:first-child td:nth-child(' + (i + 1) + ')');
                                var columnWidth = tdElems ? tdElems.offsetWidth : thElem.offsetWidth;
                                if (thElem) {
                                    thElem.style.width = columnWidth + 'px';
                                }
                                if (tdElems) {
                                    tdElems.style.width = columnWidth + 'px';
                                }
                                console.log(columnWidth)
                            });
                            angular.element(elem.querySelectorAll('thead')).css({
                                display: 'block', position: "fixed", "z-index": 100
                            });
                            /*, tfoot*/
                            angular.element(elem.querySelectorAll('tbody')).css({
                                //'display': 'block', 'height': /* $attrs.tableHeight || */'inherit', 'overflow': 'auto'
                            });
                        })
                    }
                });

            }
        };
    }]);
};