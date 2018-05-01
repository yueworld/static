module.exports = function ($app) {
    require("./user.css")
    // Dialog
    $app.dialog.user = {
        // 用户选择、使用示例
        // $app.dialog.user.choose({values: []/*默认选中*/}).then(function (result) {
        //     if (result.execute) {
        //         // do something
        //         angular.forEach(result.values,function (value) {
        //
        //         })
        //     } else {
        //         // other something
        //     }
        // })
        choose: function (option) {
            return $app.dialog.modal(angular.extend({
                values: [], single: true, width: 680,
                template: require("../views/user.choose.html"),
                controller: ["$scope", "OrganizationService", "UserService", function ($scope, orgService, userService) {
                    var option = $scope.option, org = $app.dictionary.ORGANIZATIONS, filter = $scope.filter = {};
                    // 用户列表
                    $scope.users = [];
                    // 选中列表
                    $scope.selectedUsers = [];
                    $scope.trees = [org.root];
                    $scope.expandedNodes = [$scope.trees[0]];
                    $scope.selectedNode = $scope.trees[0];
                    option.values = option.values.filter(function (value) {
                        return value != undefined;
                    })
                    $app.loading(true);
                    // 设置默认展开项
                    if (!option.values.length) {
                        // 无值时、展开当前用户所在的组织机构
                        var expandeds = [];
                        if (org.hash[$app.user.orgId]) {
                            parent(expandeds, $app.user.orgId);
                            $scope.selectedNode = org.hash[$app.user.orgId];
                        }
                        $scope.expandedNodes = $scope.expandedNodes.concat(expandeds)
                        // 加载当前用户 所在组织机构 默认条数 用户
                        userService.quick({orgId: $app.user.orgId}).then(function ($response) {
                            $scope.users = $response.data.data;
                        }).finally(function () {
                            $app.loading(false);
                        });
                    } else {
                        // 根据用户ID 获取用户信息
                        userService.quick({userIds: option.values}).then(function ($response) {
                            $scope.users = $response.data.data;
                            $scope.selectedUsers = angular.copy($scope.users);
                        }).finally(function () {
                            $app.loading(false);
                        });
                    }
                    $scope.onSelected = function (data) {
                        if (data.selected) {
                            $app.loading(true);
                            userService.quick({orgId: data.node.id}).then(function ($response) {
                                $scope.users = $response.data.data;
                            }).finally(function () {
                                $app.loading(false);
                            });
                        } else {
                            $scope.users = []
                        }
                    }
                    // 选择
                    $scope.select = function (item) {
                        var selectedUsers = $scope.selectedUsers.filter(function (selected) {
                            return selected.id == item.id;
                        });
                        if (!option.single) {
                            if (selectedUsers.length > 0) {
                                $scope.selectedUsers.remove(selectedUsers[0]);
                            } else {
                                $scope.selectedUsers.push(item);
                            }
                        } else {
                            if (selectedUsers.length > 0 && selectedUsers[0].id == item.id) {
                                $scope.selectedUsers = [];
                            } else {
                                $scope.selectedUsers = [item];
                            }
                        }
                    }
                    // 是否选择
                    $scope.isSelected = function (item) {
                        return $scope.selectedUsers.filter(function (selected) {
                                return selected.id == item.id;
                            }).length > 0;
                    }
                    $scope.submit = function (execute) {
                        $scope.close(function () {
                            option.deferred.resolve({execute: execute, values: $scope.selectedUsers});
                        })
                    }
                    $scope.$watch("filter.term", $app.watch(function (n, o) {
                        $app.loading(true);
                        userService.quick(filter).then(function ($response) {
                            $scope.users = $response.data.data;
                        }).finally(function () {
                            $app.loading(false);
                        });
                    }, 300))
                    function parent(container, id) {
                        var item = org.hash[id];
                        if (item) {
                            container.push(item);
                            if (org.hash[item.parentId]) {
                                parent(container, item.parentId);
                            }
                        }
                        return container;
                    }

                    $scope.justLookSelected = function () {
                        $scope.users = []
                    }
                }]
            }, option));
        }
    }
}