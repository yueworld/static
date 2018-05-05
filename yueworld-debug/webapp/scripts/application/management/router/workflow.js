module.exports = function ($app, $state) {

    // =========================================== 网批 =================================================================
    // 业务网批
    $state.state("management.workflow", {
        url: "/workflow", "abstract": true, template: require("../views/workflow/workflow.default.html")
    })
    // 业务网批
    $state.state("management.workflow.process", {
        url: "/process", "abstract": true, template: require("../views/workflow/workflow.process.default.html"),
        controller: require("../controller/workflow").process.default($app),
        resolve: {
            $response: ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                /*return $q.all([
                    workflowService.quickCategory()
                ]).then(function ($response) {
                    return {
                        categories: $app.buildOption($response[0].data.data, true, function (category) {
                            return category.isEnabled == 1;
                        })
                    }
                })*/
                return {};
            }]
        }
    });
    $state.state("management.workflow.process.index", {
        url: "/index.html?operationId", template: require("../views/workflow/workflow.process.index.html"),
        controller: require("../controller/workflow").process.index($app),
        resolve: {
            "$response": ["$rootScope", "$q", "ProjectService", "WorkflowService", function ($rootScope, $q, projectService, workflowService) {
                /*return $q.all([
                    projectService.quick(),
                    workflowService.findInstancePager($app.helper.extend({
                        operationId: 1001,
                        size: 10
                    }, $app.router.params, true))
                ]).then(function ($response) {
                    return {
                        projects: $response[0].data.data,
                        instants: $response[1]
                    }
                })*/
                return {
                    projects: {},
                    instants: {}
                }
            }]
        }
    })
    // 查看网批
    $state.state("management.workflow.process.instance", {
        url: "/instance.html?id&taskId", template: require("../views/workflow/workflow.process.instance.html"),
        controller: require("../controller/workflow").process.instance($app),
        resolve: {
            "$response": ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                /*return $q.all([
                    workflowService.getInstanceDetail($app.router.params.id, $app.router.params.taskId)
                ]).then(function ($response) {
                    return {
                        data: $response[0]
                    }
                });*/
                return {data:{}};
            }]
        }
    });
    // =================================================================================================================
    // 流程设计
    $state.state("management.workflow.design", {
        url: "/design", "abstract": true, template: require("../views/workflow/workflow.design.default.html"),
        controller: require("../controller/workflow").design.default($app),
        resolve: {
            $response: ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                return $q.all([
                    workflowService.quickCategory()
                ]).then(function ($response) {
                    return {
                        categories: $app.buildOption($response[0].data.data, true)
                    }
                })
            }]
        }
    })
    // 首页
    $state.state("management.workflow.design.index", {
        url: "/index.html", template: require("../views/workflow/workflow.design.index.html"),
    })
    // 基本信息
    $state.state("management.workflow.design.basic", {
        url: "/basic.html?id",
        template: require("../views/workflow/workflow.design.basic.html"),
        controller: require("../controller/workflow").design.basic($app),
        resolve: {
            $response: ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                return $q.all([
                    workflowService.findProcessById($app.router.params.id)
                ]).then(function ($response) {
                    return {
                        process: $response[0].data.data
                    }
                })
            }]
        }
    });
    $state.state("management.workflow.design.diagram", {
        url: "/diagram.html?id",
        template: require("../views/workflow/workflow.design.diagram.html"),
        controller: require("../controller/workflow").design.diagram($app),
        resolve: {
            $response: ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                return $q.all([
                    workflowService.findProcessById($app.router.params.id),
                    workflowService.findModelIdAndRegisterModel($app.router.params.id),
                ]).then(function ($response) {
                    return {
                        process: $response[0].data.data,
                        modelId: $response[1].data.data
                    }
                })
            }]
        }
    });
    $state.state("management.workflow.design.form", {
        url: "/form.html?id",
        template: require("../views/workflow/workflow.design.form.html"),
        controller: require("../controller/workflow").design.form($app),
        resolve: {
            $response: ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                return $q.all([
                    workflowService.findProcessById($app.router.params.id),
                    workflowService.findFormByProcessId($app.router.params.id)
                ]).then(function ($response) {
                    return {
                        process: $response[0].data.data,
                        forms: $response[1].data.data
                    }
                })
            }]
        }
    });
    // 审批人员
    $state.state("management.workflow.design.user", {
        url: "/user.html?id",
        template: require("../views/workflow/design/user.html"),
        controller: require("../controller/workflow").design.user($app),
        resolve: {
            $response: ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                return $q.all([
                    workflowService.findProcessById($app.router.params.id),
                    workflowService.findNodeByProcessId($app.router.params.id)
                ]).then(function ($response) {
                    return {
                        process: $response[0].data.data,
                        nodes: $response[1].data.data
                    }
                })
            }]
        }
    });
    // 节点配置
    $state.state("management.workflow.design.node", {
        url: "/node.html?id",
        template: require("../views/workflow/workflow.design.node.html"),
        controller: require("../controller/workflow").design.node($app),
        resolve: {
            $response: ["$rootScope", "$q", "WorkflowService", function ($rootScope, $q, workflowService) {
                return $q.all([
                    workflowService.findProcessById($app.router.params.id),
                    workflowService.findNodeConfigByProcessId($app.router.params.id, false)
                ]).then(function ($response) {
                    return {
                        process: $response[0].data.data,
                        nodes: $app.buildOption($response[1].data.data.filter(function (node) {
                            return node.type != "startEvent" && node.type != "endEvent" ? node : undefined;
                        }), true)
                    }
                })
            }]
        }
    });
};