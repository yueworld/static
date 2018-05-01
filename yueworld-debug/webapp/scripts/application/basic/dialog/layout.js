module.exports = function ($app) {
    // 引入样式
    require("../views/layout/layout.manager.css");
    require("../views/layout/layout.choose.css");
    // Dialog
    $app.dialog.layout = {
        // 业态管理
        manager: function (option) {
            return $app.dialog.modal({
                width: 260, template: require("../views/layout/layout.manager.html"),
                controller: ["$scope", "$timeout", "$element", "LayoutService", function ($scope, $timeout, $element, layoutService) {
                    $scope.trees = [$app.dictionary.LAYOUTS.root];
                    $scope.expandedNodes = [$scope.trees[0]];
                    $scope.selectedNode = $scope.trees[0];
                    $scope.select = function (item) {
                        $element.width(680);
                        $scope.input = item;
                        if ($scope.selectedNode && !item.parentId) {
                            item.parentId = $scope.selectedNode.id;
                        }
                    }
                    $scope.cancel = function () {
                        if ($scope.input) {
                            $scope.input = undefined;
                            $element.width(260);
                        } else {
                            $scope.close();
                        }
                    }
                    $scope.onSelected = function (node) {
                        if (node.selected && node.node.id != '-1') {
                            $scope.select(angular.extend({}, node.node));
                        } else {
                            $scope.input = undefined;
                            $element.width(260);
                        }
                    }
                    $scope.selectParentCategory = function () {
                        $app.dialog.layout.choose({values: [$scope.input.parentId]}).then(function (results) {
                            if (results.execute) {
                                angular.forEach(results.values, function (value) {
                                    $scope.input.parentId = value.id;
                                })
                            }
                        })
                    }
                    $scope.drop = function () {
                        $app.dialog.confirm({message: "您正在删除业态<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                            if (result.execute) {
                                $app.loading(true);
                                layoutService.drop($scope.input.id).then(function ($response) {
                                    if ($response.data.success) {
                                        $scope.cancel()
                                        $scope.trees = [$app.dictionary.LAYOUTS.root];
                                        $app.tip.success({message: "操作完成"});
                                    } else {
                                        $app.dialog.error({message: $response.data.message});
                                    }
                                }).finally(function () {
                                    $app.loading(false);
                                })
                            }
                        });
                    }
                    $scope.submit = function () {
                        var input = $scope.input;
                        $app.loading(true);
                        layoutService.publish(angular.toJson(input)).then(function ($response) {
                            if ($response.data.success) {
                                input.id = $response.data.data;
                                $scope.trees = [$app.dictionary.LAYOUTS.root];
                                $scope.selectedNode = input;
                                $scope.expandedNodes.push($app.dictionary.LAYOUTS.hash[input.parentId]);
                                $scope.selectedNode = $app.dictionary.LAYOUTS.hash[input.id];
                                $app.tip.success({message: "操作完成"});
                            } else {
                                $app.dialog.error({message: $response.data.message});
                            }
                        }).finally(function () {
                            $app.loading(false);
                        })
                    }
                }]
            });
        },
        // 业态选择
        choose: function (option) {
            return $app.dialog.modal(angular.extend({
                title: "业态",
                items: $app.dictionary.LAYOUTS,
                values: [],
                single: false,
                width: 260,
                template: require("../views/layout/layout.choose.html"),
                controller: ["$scope", "$timeout", "$element", function ($scope, $timeout, $element) {
                    var option = angular.extend({
                        items: [],
                        values: [],
                        expandedNodes: [],
                        filterExpression: angular.noop
                    }, $scope.option);
                    $scope.onSelected = function (node) {
                        $scope.selected = node.selected ? node.node : undefined;
                    }
                    $scope.selected = {};
                    $scope.trees = [option.items.root];
                    $scope.expandedNodes = [option.items.root];
                    $scope.selectedNode = option.items.root;
                    var expandeds = [];
                    angular.forEach(option.values, function (id) {
                        if (option.items.hash[id]) {
                            // 展开父目录
                            expanded(expandeds, id);
                            $scope.selectedNode = option.items.hash[id];
                        }
                    })
                    angular.forEach(option.expandedNodes, function (id) {
                        if (option.items.hash[id]) {
                            // 展开父目录
                            expanded(expandeds, id);
                        }
                    })
                    $scope.expandedNodes = $scope.expandedNodes.concat(expandeds)
                    // 展开节点
                    function expanded(expandeds, id) {
                        var item = option.items.hash[id];
                        if (item) {
                            if (expandeds.indexOf(item) == -1) {
                                expandeds.push(item);
                            }
                            if (option.items.hash[item.parentId]) {
                                expanded(expandeds, item.parentId);
                            }
                        }
                        return expandeds;
                    }

                    $scope.submit = function (execute) {
                        var selected = !option.filter ? $scope.selectedNode : $scope.selectedNode && option.filter($scope.selectedNode) ? $scope.selectedNode : undefined;
                        if (execute) {
                            if (selected) {
                                $scope.close(function () {
                                    option.deferred.resolve({execute: execute, values: [selected]})
                                })
                            }
                        } else {
                            $scope.close(function () {
                                option.deferred.resolve({execute: false, values: [{}]})
                            })
                        }
                    }
                    // 记录展开状态
                    $scope.$watch("expandedNodes", function (expandes) {
                        option.deferred.notify({action: "expanded", values: expandes})
                    }, true)
                    $timeout(function () {
                        var container = $element.find("div.selector-body>div"),
                            selected = $element.find("div.selected"),
                            scrollTop = selected.length > 0 ? selected.offset().top - container.height() : 0;
                        if (scrollTop > 0) {
                            container.animate({scrollTop: scrollTop});
                        }
                    }, 300)
                }]
            }, option));
        }
    }
}