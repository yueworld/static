// 文件管理
module.exports = function ($app) {
    require("../views/file.manager.scss");
    var template = require("../views/file.manager.html")
    // 使用示例
    // $app.platform.dialog.fileManager({files: []}).then(function (result) {
    //     if (result.execute) {
    //     } else {
    //     }
    // })
    function show(option) {
        if (!option || !option.category) {
            return $app.msgbox.error({message: "$app.platform.dialog.fileManager<br/>未提供 category 参数！"})
        } else if (option.load && !option.targetId) {
            return $app.msgbox.error({message: "$app.platform.dialog.fileManager<br/>开启自动加载时 targetId 不能为空！"})
        }
        option.resolve = option.load ? {
            files: function () {
                return $app.injector.get("FileService").findByCategoryAndTargetId(option.category, option.targetId).then(function ($response) {
                    return $response.data.data;
                });
            }
        } : {
            files: function () {
                return [];
            }
        }
        return $app.modal({
            title: "附件管理",
            files: [],
            // 开启自动装载 附件列表逻辑、要求 targetId不能为空
            load: false,
            width: 680, template: template,
            controller: ["$scope", "files", "FileService", function ($scope, files, fileService) {
                var option = $scope.option,
                    attachments = $scope.attachments = {
                        // 配置
                        single: false,
                        category: option.category,
                        targetId: option.targetId,
                        maxSize: option.maxSize || 20 * 1024,
                        complete: function (attachment) {
                            option.files.push(attachment);
                            option.deferred.notify({type: "complete", values: option.files});
                        }
                    };
                option.files = files;
                $scope.onSelected = function (node) {
                    $scope.selected = node.selected ? node.node : undefined;
                }
                $scope.drop = function (file) {
                    $app.msgbox.confirm({message: "您正在删除附件<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                        if (result.execute) {
                            $app.loading(true);
                            fileService.drop(file.id).then(function ($response) {
                                if ($response.data.success) {
                                    option.files.remove(file);
                                    $app.tip.success({message: "操作完成"});
                                    option.deferred.notify({type: "drop", values: option.files});
                                } else {
                                    $app.msgbox.error({message: $response.data.message});
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
        }, option);
    }

    $app.platform.dialog.fileManager = show;
}