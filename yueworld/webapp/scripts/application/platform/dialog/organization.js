module.exports = function ($app) {
    // Dialog
    $app.dialog.organization = {
        choose: function (option) {
            return $app.dialog.modal(angular.extend({
                title: "机构", items: $app.dictionary.ORGANIZATIONS, values: [], single: false, width: 300, height: 300,
                template: require("../views/organization.choose.html"),
                controller: ["$scope", function ($scope) {
                    var option = angular.extend({
                        items: [],
                        values: [],
                        expandedItems: [],
                        filterExpression: angular.noop
                    }, $scope.option);
                    $scope.onSelected = function (node) {
                        $scope.selected = node.selected ? node.node : undefined;
                    }
                    $scope.selected = {};
                    $scope.trees = [option.items.root];
                    $scope.expandedItems = [option.items.root];
                    $scope.selectedNode = option.items.root;
                    var expandeds = [];
                    angular.forEach(option.values, function (id) {
                        if (option.items.hash[id]) {
                            // 展开父目录
                            expanded(expandeds, id);
                            $scope.selectedNode = option.items.hash[id];
                        }
                    })
                    angular.forEach(option.expandedItems, function (id) {
                        if (option.items.hash[id]) {
                            // 展开父目录
                            expanded(expandeds, id);
                        }
                    })
                    $scope.expandedItems = $scope.expandedItems.concat(expandeds)
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
                    $scope.$watch("expandedItems", function (expandes) {
                        option.deferred.notify({action: "expanded", values: expandes})
                    }, true)
                }]
            }, option));

        }
    }
}