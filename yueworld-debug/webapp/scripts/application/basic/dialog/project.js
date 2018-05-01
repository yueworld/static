module.exports = function ($app) {
    // 引入样式
    require("../views/project/project.choose.scss");
    // Dialog
    $app.dialog.project = {
        choose: function (option) {
            return $app.dialog.modal(angular.extend({
                title: "项目", items: angular.copy($app.dictionary.PROJECTS.options),
                values: [], single: true, width: 680,
                template: require("../views/project/project.choose.html"),
                controller: ["$scope", function ($scope) {
                    var option = $scope.option;
                    var items = $scope.items = [{
                        id: -1,
                        text: "全部项目列表",
                        selected: false,
                        children: option.items
                    }];
                    $scope.onSelected = function (item) {
                        var root = items[0];
                        if (option.single) {
                            if (item.id != -1) {
                                // 单选
                                root.selected = true;
                                root.halfSelected = true;
                                // 全选
                                angular.forEach(root.children, function (item2) {
                                    if (item2.selected && (item2.id == item.id)) {
                                        item2.selected = false;
                                        root.selected = false;
                                        root.halfSelected = false;
                                    } else {
                                        item2.selected = item2.id == item.id;
                                    }
                                })
                            }
                        } else {
                            item.selected = !item.selected;
                            // 多选
                            if (root.children.length == 0) {
                                // 无子节点
                                root.selected = false;
                                root.halfSelected = false;
                            } else if (item.id == -1) {
                                root.halfSelected = false;
                                // 根节点选中
                                if (root.selected) {
                                    // 全选
                                    angular.forEach(root.children, function (item) {
                                        item.selected = true;
                                    })
                                } else {
                                    // 全不选
                                    angular.forEach(root.children, function (item) {
                                        item.selected = false;
                                    })
                                }
                            } else {
                                // 子节点选中
                                var selectedCount = root.children.filter(function (item) {
                                    return item.selected;
                                }).length;
                                root.selected = selectedCount == root.children.length;
                                root.halfSelected = !root.selected && selectedCount > 0;
                            }
                        }
                    }
                    angular.forEach(option.values, function (id) {
                        var item = $app.dictionary.PROJECTS.hash[id];
                        if (item) {
                            $scope.onSelected(item)
                        }
                    })
                    $scope.submit = function (execute) {
                        $scope.close(function () {
                            option.deferred.resolve({
                                execute: execute, values: items[0].children ? items[0].children.filter(function (item) {
                                    return item.selected;
                                }) : []
                            });
                        })
                    }
                }]
            }, option));
        }
    }
}