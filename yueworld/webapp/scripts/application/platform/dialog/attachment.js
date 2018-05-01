module.exports = function ($app) {
    // 使用示例
    // $app.dialog.attachment.manager({files: []}).then(function (result) {
    //     if (result.execute) {
    //     } else {
    //     }
    // })
    // 附件管理器
    require("./attachment.css")
    $app.dialog.attachment = {
        manager: function (option) {
            if (!option.category) {
                return $app.dialog.error({message: "未提供 category 参数！"})
            }
            return $app.dialog.modal(angular.extend({
                title: "附件管理",
                files: [],
                // 开启自动装载 附件列表逻辑、要求 targetId不能为空
                load: false,
                width: 680,
                template: require("../views/attachment.html"),
                controller: ["$scope", "AttachmentService", function ($scope, attachmentService) {
                    var option = $scope.option,
                        attachments = $scope.attachments = {// 上传配置
                            single: false,
                            category: option.category,
                            targetId: option.targetId,
                            maxSize: option.maxSize || 20 * 1024,
                            complete: function (attachment) {
                                option.files.push(attachment);
                                option.deferred.notify({type: "complete", values: option.files});
                            }
                        };
                    if (option.load) {
                        option.files = [];
                        $app.assert(!option.targetId, "开启自动加载时 targetId 不能为空！");
                        $app.loading(true);
                        attachmentService.findByTargetId(option.targetId).then(function ($response) {
                            option.files = $response.data.data.results;
                        }).finally(function () {
                            $app.loading(false);
                        })
                    }
                    $scope.onSelected = function (node) {
                        $scope.selected = node.selected ? node.node : undefined;
                    }
                    $scope.drop = function (file) {
                        $app.dialog.confirm({message: "您正在删除附件<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                            if (result.execute) {
                                $app.loading(true);
                                attachmentService.drop(file.id).then(function ($response) {
                                    if ($response.data.success) {
                                        option.files.remove(file);
                                        $app.tip.success({message: "操作完成"});
                                        option.deferred.notify({type: "drop", values: option.files});
                                    } else {
                                        $app.dialog.error({message: $response.data.message});
                                    }
                                }).finally(function () {
                                    $app.loading(false);
                                })
                            }
                        })
                    }
                    $scope.submit = function (execute) {
                        $scope.close(function () {
                            option.deferred.resolve({execute: execute, values: option.files});
                        })
                    }
                }]
            }, option));
        }
    }
}