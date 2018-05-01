module.exports = function ($app) {
    require("./select.css")
    // Dialog
    $app.dialog.select = {
        // 简洁版
        simple: function (option) {
            return $app.dialog.modal(angular.extend({
                title: "简单选择器", items: [], values: [], single: true, multiple: false, width: 260,
                template: require("../views/select.simple.html"),
                controller: ["$scope", function ($scope) {
                    var option = $scope.option,
                        items = $scope.items = option.items;
                    angular.forEach(option.values, function (value) {
                        angular.forEach(option.items, function (item) {
                            if (value == item.id) {
                                item.selected = true;
                            }
                        })
                    })
                    $scope.setSelectedItem = function (item) {
                        if (option.single && !option.multiple) {
                            items.filter(function (item) {
                                item.selected = false;
                            })
                        }
                        item.selected = !item.selected;
                    }
                    $scope.submit = function (execute) {
                        $scope.close(function () {
                            option.deferred.resolve({
                                execute: execute, values: option.items.filter(function (item) {
                                    return item.selected;
                                })
                            });
                        })
                    }
                }]
            }, option));
        }
    }
}