module.exports = function ($app) {
    // Dialog
    $app.dialog.head = {
        // 添加、修改公司抬头
        publish: function (input, refresh) {
            return $app.modal({
                title: "公司抬头",
                input: input,
                width: 800,
                template: require("../views/info/head/publish.html"),
                controller: ["$scope", "HeadService", function ($scope, headService) {
                    $scope.submit = function () {
                        $app.loading(true);
                        headService.publish(angular.toJson(input)).then(function ($response) {
                            var response = $response.data;
                            $app.loading(false);
                            if (response.success) {
                                $scope.close(function () {
                                    $app.tip.success({message: "操作完成"});
                                    refresh && refresh();
                                })
                            } else {
                                $app.msgbox.error({message: response.message});
                            }
                        })
                    }
                    $scope.drop = function () {
                        $app.msgbox.confirm({message: "您正在删除合同抬头信息<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                            if (result.execute) {
                                $app.loading(true);
                                headService.drop(input.id).then(function ($response) {
                                    var response = $response.data;
                                    $app.loading(false);
                                    if (response.success) {
                                        $scope.close(function () {
                                            $app.tip.success({message: "操作完成"});
                                            refresh && refresh();
                                        })
                                    } else {
                                        $app.msgbox.error({message: response.message});
                                    }
                                })
                            }
                        })
                    }
                }]
            })
        }
    }
}