//=========================================================================
//============================= NEW 2017-08-13 ============================
//=========================================================================
module.exports = function ($app) {

    // 工作流
    $app.register.factory("WorkflowService", ["RequestService", function (requestService) {
        return {
            // ============================== 目录 =====================================================================
            // 新增修改
            publishCategory: function (input) {
                return requestService.post("sdk/workflow", {params: angular.extend({action: 1002}, {input: input})});
            },
            // 删除
            dropCategory: function (categoryId) {
                return requestService.get("sdk/workflow", {params: {action: 1003, categoryId: categoryId}});
            },
            // 快速查询
            quickCategory: function (categoryId) {
                return requestService.get("sdk/workflow", {params: {action: 1004, categoryId: categoryId}});
            },
            // ============================== 流程 =====================================================================
            // 新增修改
            publishProcess: function (input) {
                return requestService.post("sdk/workflow", {params: {action: 2002, input: input}});
            },
            // 复制
            copyProcess: function (sourceProcessId, input) {
                return requestService.post("sdk/workflow", {
                    params: {
                        action: 2006,
                        sourceProcessId: sourceProcessId,
                        input: input
                    }
                });
            },
            // 删除
            dropProcess: function (processId) {
                return requestService.get("sdk/workflow", {params: {action: 2003, processId: processId}});
            },
            // 快速查询
            findProcessById: function (processId) {
                return requestService.get("sdk/workflow", {params: {action: 2005, processId: processId}});
            },
            // ============================== 节点 ======================================================================
            // 新增修改
            publishNode: function (input) {
                return requestService.get("sdk/workflow", {params: {action: 8002, input: angular.toJson(input)}});
            },
            // 快速查询
            findNodeByProcessId: function (processId, isOnlyIncludeUserTaskNode) {
                return requestService.get("sdk/workflow", {
                    params: {
                        action: 8001,
                        processId: processId,
                        isOnlyIncludeUserTaskNode: undefined == isOnlyIncludeUserTaskNode ? true : isOnlyIncludeUserTaskNode
                    }
                });
            },
            findNodeConfigByProcessId: function (processId, isOnlyIncludeUserTaskNode) {
                return requestService.get("sdk/workflow", {
                    params: {
                        action: 8003,
                        processId: processId,
                        isOnlyIncludeUserTaskNode: undefined == isOnlyIncludeUserTaskNode ? true : isOnlyIncludeUserTaskNode
                    }
                });
            },
            // ============================== 表单 ======================================================================
            // 新增修改
            publishForm: function (input) {
                return requestService.post("sdk/workflow", {params: {action: 3002, input: input}});
            },
            // 删除
            dropForm: function (formId) {
                return requestService.get("sdk/workflow", {params: {action: 3003, formId: formId}});
            },
            // 快速查询
            findFormByProcessId: function (processId) {
                return requestService.get("sdk/workflow", {params: {action: 3001, processId: processId}});
            },
            toggleFormEnabledStatus: function (formId) {
                // 切换表单可用状态
                return requestService.post("sdk/workflow", {params: {action: 3010, formId: formId}})
            },
            // ============================== ActivitiModel ============================================================
            // 新增修改
            publishModel: function (input) {
                return requestService.post("sdk/workflow", {params: angular.extend({action: 4002}, {input: input})});
            },
            // 模型详情
            findModelById: function (modelId) {
                return requestService.get("sdk/workflow", {params: {action: 4005, modelId: modelId}});
            },
            // 通过 WorkflowProcess 获取/生成 ActivitiModel
            findModelIdAndRegisterModel: function (processId) {
                return requestService.get("sdk/workflow", {params: {action: 4010, processId: processId}});
            },
            // 读取流程图、Base64格式
            getDiagramByProcessId: function (processId) {
                return requestService.get("sdk/workflow", {params: {action: 4011, processId: processId}});
            },
            // 部署流程
            deploymentModelByProcessId: function (processId) {
                return requestService.get("sdk/workflow", {params: {action: 4013, processId: processId}});
            },
            // ============================== 实例 =====================================================================
            // 查询各种状态的 网批
            findInstancePager: function (params) {
                return requestService.post("sdk/workflow", {params: {action: 6001, params: angular.toJson(params)}});
            },
            // 启动流程创建一个实例
            startProcessById: function (processId) {
                return requestService.get("sdk/workflow", {params: {action: 5002, processId: processId}});
            },
            // 获取任务表单
            getInstanceDetail: function (insId, taskId) {
                return requestService.get("sdk/workflow", {
                    params: {
                        action: 5005,
                        insId: insId,
                        taskId: taskId
                    }
                }).then(function ($response) {
                    var data = $response.data.data;
                    try {
                        // 读取 Cache 内的 controller
                        data.form.controller = $app.cache.get(data.form.id);
                        if (!data.form.controller) {
                            $app.executeScript(data.form.script, function (controller) {
                                data.form.controller = controller;
                                // Cache
                                $app.cache.set(data.form.id, controller);
                            });
                            $app.assert(!angular.isArray(data.form.controller) && !angular.isFunction(data.form.controller), "表单脚本异常、请检查制台异常信息后调整配置！");
                        }
                    } catch (ex) {
                        if (data) {
                            data.form.error = ex.message
                        } else {
                            data = {form: {error: $response.message}};
                        }
                    }
                    return data;
                });
            },
            dropInstance: function (insId) {
                return requestService.post("sdk/workflow", {params: {action: 5003, insId: insId}})
            },
            // ============================== 任务 ======================================================================
            // 提交任务表单数据
            submitTaskForm: function (taskId, formId, input) {
                return requestService.post("sdk/workflow", {
                    params: {action: 6003, taskId: taskId, formId: formId, input: input}
                });
            },
            // 设置实例状态为 填写审批人
            setInstanceStatusToFillApprovalUser: function (insId) {
                return requestService.post("sdk/workflow", {
                    params: {action: 6005, insId: insId}
                });
            },
            // 设置实例状态为 新增
            setInstanceStatusToInit: function (insId) {
                return requestService.post("sdk/workflow", {
                    params: {action: 6006, insId: insId}
                });
            },
            // 提交任务／发起任务
            submit: function (approval) {
                return requestService.post("sdk/workflow", {
                    params: {action: 6666, command: angular.toJson(approval)}
                });
            },
            // 根据实例编号返回 带状态的流程图
            getDiagramByInsId: function (insId) {
                return requestService.get("sdk/workflow", {params: {action: 6004, insId: insId}});
            }
        }
    }]);

}