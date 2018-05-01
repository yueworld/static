//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("AttachmentService", ["RequestService", function (requestService) {
        return {
            findByTargetId: function (targetId) {
                return requestService.post("sdk/platform/attachment", {
                    params: {
                        action: 1001,
                        targetId: targetId,
                        size: 1000
                    }
                });
            },
            drop: function (id) {
                return requestService.post("sdk/platform/attachment", {params: {action: 1003, id: id}})
            }, dropDispose: function (files, file) {
                $app.dialog.confirm({message: "您正在删除附件<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                    if (result.execute) {
                        $app.loading(true);
                        requestService.post("sdk/platform/attachment", {
                            params: {
                                action: 1003,
                                id: file.id
                            }
                        }).then(function ($response) {
                            var response = $response.data;
                            if (response.success) {
                                files.remove(file);
                                $app.tip.success({message: "操作完成"});
                            } else {
                                $app.dialog.error({message: response.message});
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
