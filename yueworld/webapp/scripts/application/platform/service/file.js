module.exports = function ($app) {
    $app.register.factory("FileService", ["RequestService", function (requestService) {
        return {
            findByCategoryAndTargetId: function (category, targetId) {
                return requestService.post("sdk/platform/file", {
                    params: {
                        action: 1001, category: category, targetId: targetId, size: 1000
                    }
                });
            }, drop: function (id) {
                return requestService.post("sdk/platform/file", {params: {action: 1003, id: id}})
            }, dropDispose: function (files, file) {
                $app.msgbox.confirm({message: "您正在删除附件<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                    if (result.execute) {
                        $app.loading(true);
                        requestService.post("sdk/platform/file", {
                            params: {
                                action: 1003, id: file.id
                            }
                        }).then(function ($response) {
                            var response = $response.data;
                            if (response.success) {
                                files.remove(file);
                                $app.tip.success({message: "操作完成"});
                            } else {
                                $app.msgbox.error({message: response.message});
                            }
                        }).finally(function () {
                            $app.loading(false);
                        })
                    }
                })
            }
        }
    }]);
}
