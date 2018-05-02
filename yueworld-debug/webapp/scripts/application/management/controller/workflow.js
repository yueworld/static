require("../views/workflow/workflow.design.css");
module.exports = {
    // 审批流程
    process: {
        // 默认页
        default: function ($app) {
            require("../views/workflow/workflow.process.index.css");
            return ["$scope", "$response", "WorkflowService", function ($scope, $response, workflowService) {
                var foldingStatus = $scope.foldingStatus = $app.cookie.get("ys-wf-folding-status", "2");
                var categories = $scope.categories = $response.categories,
                    // 流程目录展开状态
                    ysWfProcessExpandedStatus = $app.cookie.get("ys-wf-process-expanded-status", "").split(",");
                // 全屏
                $scope.folding = function () {
                    $app.cookie.set({
                        name: "ys-wf-folding-status",
                        value: foldingStatus = $scope.foldingStatus = ( $scope.foldingStatus == "2" ? "1" : "2")
                    });
                }
                $scope.expandedCategories = [];/*categories.options.filter(function (category) {
                    return category.id == "-1" || ysWfProcessExpandedStatus.indexOf(category.id) != -1
                });*/
                /*$scope.selectedNode = categories.options.some(function (category) {
                    return category.id == $app.router.params.processId;
                }) ? categories.options.filter(function (category) {
                    return category.id == $app.router.params.processId
                })[0] : categories.root;*/
                // 刷新 左侧树
                $scope.refresh = function () {
                    $app.loading(true)
                    workflowService.quickCategory().then(function ($response) {
                        categories = $scope.categories = $app.buildOption($response.data.data, true, function (category) {
                            return category.isEnabled == 1;
                        });
                    }).finally(function () {
                        $app.loading(false)
                    })
                }
                $scope.onSelection = function (node) {
                    if (node.node.isCategory == 2 && node.selected) {
                        $app.router.go("management.workflow.process.index", {processId: node.node.id});
                    } else {
                        $app.router.go("management.workflow.process.index", {processId: ""});
                    }
                }

                // 记录流程目录展开状态
                $scope.$watch("expandedCategories", function (expandes) {
                    $app.cookie.set({
                        name: "ys-wf-process-expanded-status",
                        value: expandes.map(function (category) {
                            return category.id;
                        }).join(",")
                    });
                }, true)
            }];
        },
        // 首页
        index: function ($app) {
            return ["$scope", "$state", "$q", "$timeout", "$response", "WorkflowService", function ($scope, $state, $q, $timeout, $response, workflowService) {
                var pager = $scope.pager = {};//$response.instants.data.data,
                    filter = $scope.filter = $app.extend({operationId: 1001, size: 10}, $app.router.params, true),
                    projects = $scope.projects = $app.buildOption($response.projects), timer = 0;

                // 项目
                $scope.pos = {single: true, placeholder: " -- 请选择 --", data: projects.options};

                // 选择发起人
                $scope.selectUser = function (charge) {
                    $app.dialog.user({values: [filter.creator]}).then(function (resrult) {
                        if (resrult.execute) {
                            if (resrult.values.length) {
                                filter.creator = resrult.values[0].id;
                                filter.realname = resrult.values[0].realname;
                            } else {
                                filter.creator = filter.realname = undefined;
                            }
                        }
                    })
                }

                // 新增网批
                $scope.start = function () {
                    var deferred = $q.defer();
                    deferred.promise.then(function (processId) {
                        $app.loading(true);
                        workflowService.startProcessById(processId).then(function ($response) {
                            if ($response.data.success) {
                                $state.go("management.workflow.process.instance", {taskId: $response.data.data});
                            } else {
                                $app.loading(false);
                                $app.dialog.error({message: $response.data.message});
                            }
                        })
                    })
                    var selected = $scope.$parent.selectedNode;
                    if (selected && selected.isCategory == 2) {
                        deferred.resolve(selected.id);
                    } else {
                        $app.dialog.management.process.tree(function (selected) {
                            return selected.isCategory == 2;
                        }).then(function (result) {
                            if (result.execute) {
                                angular.forEach(result.values, function (value) {
                                    deferred.resolve(value.id);
                                })
                            }
                        });
                    }
                }
                $scope.taskName = function (tasks) {
                    var taskName = "";
                    angular.forEach((tasks || []).reduce(function (source, item) {
                        var node = source[item.nodeId];
                        if (!node) {
                            node = source[item.nodeId] = item;
                        } else if (node.nodeName.indexOf("会签") == -1) {
                            node.nodeName = node.nodeName + " (会签)"
                        }
                        return source;
                    }, {}), function (node) {
                        taskName = (!taskName ? "" : ",") + node.nodeName;
                    })
                    return taskName;
                }
                $scope.taskApprovalUserRealname = function (tasks) {
                    return (tasks || []).map(function (task) {
                        return task.approvalUserRealname;
                    }).join(",");
                }
                $scope.detail = function (instance) {
                    if (filter.operationId == 1001) {
                        // 待办事项、任务必定存在
                        $app.router.go("management.workflow.process.instance", {
                            taskId: instance.tasks.filter(function (task) {
                                return task.approvalUserId == $app.user.id;
                            })[0].id
                        });
                    } else {
                        $app.router.go("management.workflow.process.instance", {id: instance.id});
                    }
                }

                $scope.$watch("filter.operationId+filter.projectId+filter.keyword+filter.applyUserId+filter.startDate+filter.endDate+filter.page", function (n1, o1) {
                    // 未发生任何改变
                    if (n1 != o1) {
                        $app.loading(true);
                        workflowService.findInstancePager(filter).then(function ($response) {
                            pager = $scope.pager = $response.data.data;
                            filter.page = pager.page
                        }).finally(function () {
                            $app.loading(false);
                        })
                    }
                })
            }];
        },
        // 实例
        instance: function ($app) {
            /**
             * 开放给API 给模版 Controller
             * @param ApiFactory
             * @param renderedTaskFormData
             * @param input
             * @returns {{temporary: temporary, attachment: attachment, diagram: diagram, fillApplyUser: fillApplyUser, cancelFillApplyUser: cancelFillApplyUser}}
             * @constructor
             */
            function ApiFactory($q, $timeout, $scope, $element, workflowService, attachmentService, data) {
                var input = data.form.data[data.form.code] ? data.form.data[data.form.code] : {};
                data.form.isEdit = data.instance.statusId <= 1002 && data.instance.applyUserId == $app.user.id;
                return angular.extend(data, {
                    // 约定设置、全部为可选项
                    setting: {
                        title: "" /* 网批附标题 */,
                        keyword: "" /* 参与模糊搜索 */,
                        projectId: "" /* 所属项目 */,
                        toolbar: []
                    },
                    input: input,
                    // 服务
                    service: {
                        // 暂存
                        temporary: function (quiet/*是否静默保存*/) {
                            $app.loading(true);
                            var deferred = $q.defer();
                            var input = angular.extend({}, $scope.api.input);
                            delete input.errorCode;
                            workflowService.submitTaskForm(data.task.id, data.form.id, angular.toJson(input)).then(function ($response) {
                                if ($response.data.success) {
                                    if (!quiet) {
                                        $app.tip.success({message: "已保存"})
                                    }
                                    deferred.resolve();
                                } else {
                                    $app.dialog.error({message: $response.data.message});
                                }
                            }).finally(function () {
                                $app.loading(false);
                            })
                            return deferred.promise;
                        },
                        // 附件管理
                        attachment: function () {
                            $app.dialog.attachment({
                                load: true,
                                category: "WF_INSTANCE",
                                targetId: data.instance.id
                            }).then(angular.noop, angular.noop, function ($response) {
                                data.instance.attachments = $response.values;
                            });
                        },
                        // 查看进度
                        diagram: function () {
                            $app.dialog.modal({
                                title: data.instance.statusId == 1001 ? "查看流程" : "查看进度",
                                width: 900,
                                template: require("../views/workflow/workflow.process.diagram.html"),
                                controller: ["$scope", "$element", function ($scope) {
                                    $scope.url = $app.data.format($app.getDynamicUrl("sdk/workflow/diagram?processId={0}&insId={1}&_={2}"), data.process.id, data.instance.id, new Date().getTime());
                                }]
                            })
                        },
                        // 删除附件
                        dropAttachment: function (file) {
                            attachmentService.dropDispose(data.instance.attachments, file);
                        }, print: function () {
                            var container = $app.$("<iframe/>", {style: "position:absolute;width:0;height:0;top:-10000px;left:-10000px;"}).appendTo("body"),
                                document = $app.$(container.get(0).contentWindow.document);
                            $app.$("link").each(function () {
                                document.find("head").append("<link type='text/css' rel='stylesheet' href='/" + $(this).attr("href") + "'/>");
                            })
                            document.find("body").append($app.$("div.ys-wf-process-wrapper").html());
                            $app.loading(true)
                            $timeout(function () {
                                container.get(0).contentWindow.print();
                                container.remove();
                                $app.loading(false)
                            }, 300)
                        }
                    },
                    /* 拦截器 */
                    interceptor: {
                        // 保存
                        save: function (deferred) {
                            var isExecute = true;
                            // 延迟执行、可以返回 false 之后调用 deferred.resolve();
                            return isExecute;
                        }
                    }
                });
            }

            return ["$rootScope", "$q", "$scope", "$interval", "$filter", "$timeout", "$controller", "$compile", "$element", "$response", "WorkflowService", "AttachmentService", "PositionService",
                function ($rootScope, $q, $scope, $interval, $filter, $timeout, $controller, $compile, $element, $response, workflowService, attachmentService, positionService) {
                    // 开放 API 给表单
                    var $$scope = {$element: $element, $scope: $rootScope.$new()},
                        api = $scope.api = $$scope.$scope.api = ApiFactory($q, $timeout, $scope, $element, workflowService, attachmentService, $response.data /*renderedTaskFormData*/),
                        autoSaveTimer = 0,
                        listener = function (event, data) {
                            console.log("网批事件:" + event);
                            if (data.deferred) {
                                data.deferred.resolve({});
                            }
                        },
                        command = $scope.command = {taskId: api.task ? api.task.id : "", jumpTypeId: 1001};
                    $scope.diagramUrl = $app.data.format($app.getDynamicUrl("sdk/workflow/diagram?processId={0}&insId={1}&_={2}"), api.process.id, api.instance.id, new Date().getTime());
                    $app.tools.ade($scope, [$app.event.subscribe("/workflow/diagram-viewer/load", function (event, data) {
                        var diagramEl = $element.find("div.ys-wf-process-diagram");
                        diagramEl.find("div.loading").hide()
                        diagramEl.find("iframe").height(data.height).show();
                    })])

                    // 初始化 自定义 AngularJs Controller
                    if (!api.form.error) {
                        try {
                            $controller(api.form.controller, $$scope)
                        } catch (ex) {
                            api.form.error = $app.data.format(ex.message);
                            return;
                        }
                        // 装载 自定义 AngularJs Template
                        $app.$("div.ys-product-process-instance-template", $element).append($compile("<div class='col-xs-12 p0'>" + api.form.template + "</div>")($$scope.$scope));
                        // 自动保存
                        if (api.instance.statusId == 1001) {
                            autoSaveTimer = $interval(function () {
                                api.service.temporary(true).then(function () {
                                    $app.tip.success({message: $app.data.format("已与 {0} 自动保存！", $filter("date")(new Date(), "HH:mm:ss"))})
                                })
                            }, $app.setting.path("/workflow/intervalInMillis").value);
                        }
                    }

                    // 删除实例
                    $scope.drop = function () {
                        $app.dialog.confirm({message: "您正在删除申请<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                            if (result.execute) {
                                $app.loading(true);
                                workflowService.dropInstance(api.instance.id).then(function ($response) {
                                    var response = $response.data;
                                    if (response.success) {
                                        $app.tip.success({message: "删除完成"});
                                        $app.router.go("management.workflow.process.index", {categoryId: api.instance.categoryId});
                                    } else {
                                        $app.dialog.error({message: response.message});
                                    }
                                }).finally(function () {
                                    $app.loading(false);
                                })
                            }
                        });
                    }

                    // 设置实例状态为 填写审批人
                    $scope.setInstanceStatusToFillApprovalUser = function () {
                        var deferred = $q.defer();
                        deferred.promise.then(function () {
                            // 静默保存
                            api.service.temporary(true).then(function () {
                                workflowService.setInstanceStatusToFillApprovalUser(api.instance.id).then(function ($response) {
                                    if ($response.data.success) {
                                        $app.tip.success({message: "已进入填写审批人状态！"})
                                        // 重新加载
                                        $app.router.reload();
                                        $timeout(function () {
                                            $app.el.product.scrollTop($app.el.product.scrollTop() + 100);
                                        }, 600)
                                    } else {
                                        $app.dialog.error({message: $response.data.message});
                                    }
                                })
                            });
                        })
                        if (api.interceptor.save(deferred)) {
                            deferred.resolve();
                        }
                    }

                    // 设置实例状态为 新增
                    $scope.setInstanceStatusToInit = function () {
                        workflowService.setInstanceStatusToInit(api.instance.id).then(function ($response) {
                            if ($response.data.success) {
                                $app.tip.success({message: "已重新进入编辑状态！"})
                                // 重新加载
                                $app.router.reload();
                            } else {
                                $app.dialog.error({message: $response.data.message});
                            }
                        })
                    }

                    // 设置审批人
                    $scope.setApprovalUser = function (node) {
                        // 自定义
                        if (node.identityTypeId == 1001) {
                            $app.tip.error({message: "禁止更改、固定审批人！"});
                        } else if (node.identityTypeId == 1003) {
                            $app.dialog.pos({
                                single: node.multiInstance ? false : true,
                                title: "请选择审批人",
                                userIds: (node.approvalUserId || "").split(",")
                            }).then(function (result) {
                                if (result.execute) {
                                    var ids = [], names = [];
                                    angular.forEach(result.values, function (value) {
                                        ids.push(value.userId);
                                        names.push(value.realname);
                                    })
                                    node.approvalUserId = ids.join(",");
                                    node.approvalUserRealname = names.join(",");
                                }
                            });
                        }
                    }

                    // 完成任务
                    $scope.submit = function () {
                        try {
                            command.errorCode = undefined;
                            if (api.instance.statusId <= 1003) {
                                command.jumpTypeId = 1001;
                                command.opinion = "-";
                            }
                            var deferred = $q.defer();
                            deferred.promise.then(function () {
                                $app.loading(true);
                                command.destNodeUserIds = {};
                                angular.forEach(api.instance.nodes, function (node) {
                                    if (angular.isArray(node.approvalUserId)) {
                                        command.destNodeUserIds[node.id] = node.approvalUserId.join(",");
                                    } else {
                                        command.destNodeUserIds[node.id] = node.approvalUserId;
                                    }

                                });
                                workflowService.submit($scope.command).then(function ($response) {
                                    if ($response.data.success) {
                                        $app.tip.success({message: api.instance.statusId <= 1002 ? "发起完成" : "审批完成"});
                                        $app.router.go("management.workflow.process.index", {categoryId: api.instance.categoryId});
                                    } else {
                                        command.errorCode = $response.data.code;
                                        $app.tip.error({message: $response.data.message});
                                    }
                                }).finally(function () {
                                    $app.loading(false);
                                })
                            })
                            if (api.interceptor.save(deferred)) {
                                deferred.resolve();
                            }
                        } catch (ex) {
                            $app.dialog.error({message: ex.message});
                        }
                    }
                    // 是否有追回权限
                    $scope.isRecover = function () {
                        return api.instance.statusId > 1002 &&
                            api.task &&
                            api.task.approvalUserId == $app.user.id &&
                            api.task.next.some(function (task) {
                                // 未审批
                                return task.isComplete == 2;
                            });
                    }

                    // 构建待填写审批人的节点
                    if (api.task) {

                        // 全部节点
                        if (api.instance.nonFixedApprovalTypeId == 1001) {
                            api.instance.nfaNodes = api.instance.nodes;
                        }
                        // 下一节点
                        else if (api.instance.nonFixedApprovalTypeId == 1002) {
                            api.instance.nfaNodes = {};
                            angular.forEach(api.instance.nodes, function (node) {
                                for (var i = 0; i < api.task.next.length; i++) {
                                    var next = api.task.next[i];
                                    if (next.id == node.id) {
                                        api.instance.nfaNodes[node.id] = node;
                                        return true;
                                    }
                                }
                            })
                        }
                    }
                    // 获取即将流向的节点、和待填写的审批类型
                    // 补全 api.instance.task[*].select2Options
                    if (api.task) {
                        angular.forEach(api.instance.nfaNodes, function (node) {
                            // 固定多审批人 获取审批人 select2-options
                            if (node.identityTypeId == 1001) {
                                node.placeholder = "-- 流程发起人 --";
                            } else if (node.identityTypeId == 1002) {
                                node.select2Options = {
                                    multiple: node.multiInstance ? true : false,
                                    placeholder: "-- 请选择 / 固定审批人 --",
                                    containerCssClass: 'require',
                                    disabled: api.task.isMultiInstance || (api.instance.nonFixedApprovalTypeId == 1001 && api.instance.statusId > 1003),
                                    data: node.pos.map(function (pos) {
                                        return {id: pos.userId, text: pos.realname};
                                    })
                                }
                                node.approvalUserId = node.approvalUserId ? node.approvalUserId : node.pos.map(function (pos) {
                                    return pos.userId;
                                }).join(",");
                            } else if (node.identityTypeId == 1003) {
                                node.placeholder = "-- 请选择 / 自定义审批人 --";
                            }
                        })
                    }

                    // 常用处理意见
                    $scope.aros = {
                        single: true,
                        placeholder: '-- 常用意见 --',
                        data: $app.dictionary.WORKFLOW_OFTEN_REASONS.options,
                        select: function (option) {
                            command.opinion = option.text;
                            $scope.reason = "";
                        }
                    }
                    // 审批附件上传 approvalUploadSetting
                    $scope.aus = {
                        single: false,
                        category: "WF_INSTANCE",
                        targetId: api.instance.id,
                        complete: function (attachment) {
                            api.instance.attachments.push(attachment);
                        }
                    }

                    // 销毁表单
                    $scope.$on("$destroy", function () {
                        // 销毁自动保存定时器
                        $interval.cancel(autoSaveTimer);
                        // 销毁表单作用域
                        $$scope.$scope.$destroy();
                        listener = null;
                    })

                }
            ];
        }
    },
    // 流程设计
    design: {
        // 默认页
        default: function ($app) {
            return ["$scope", "$response", "WorkflowService", function ($scope, $response, workflowService) {
                var foldingStatus = $scope.foldingStatus = $app.cookie.get("ys-wpt-folding-status", "2"),
                    categories = $scope.categories = $response.categories,
                    ysWfDesignExpandedStatus = $app.cookie.get("ys-wf-design-expanded-status", "").split(",");
                $scope.expandedCategories = categories.options.filter(function (category) {
                    return category.id == "-1" || ysWfDesignExpandedStatus.indexOf(category.id) != -1
                });
                $scope.selectedNode = categories.options.some(function (category) {
                    return category.id == $app.router.params.id;
                }) ? categories.options.filter(function (category) {
                    return category.id == $app.router.params.id
                })[0] : categories.root;
                // 全屏
                $scope.folding = function () {
                    $app.cookie.set({
                        // workflow-process-template-folding-status
                        name: "ys-wpt-folding-status",
                        value: foldingStatus = $scope.foldingStatus = ( $scope.foldingStatus == "2" ? "1" : "2")
                    });
                }
                // 刷新 左侧树
                var refresh = $scope.refresh = function () {
                    $app.loading(true)
                    workflowService.quickCategory().then(function ($response) {
                        categories = $scope.categories = $app.buildOption($response.data.data, true);
                        // 保持选中状态
                        if ($scope.selectedNode) {
                            categories.options.forEach(function (category) {
                                if (category.id == $scope.selectedNode.id) {
                                    $scope.selectedNode = category;
                                }
                            })
                        }
                    }).finally(function () {
                        $app.loading(false)
                    })
                }

                // 新增/修改分类
                $scope.publishCategory = function (action, node) {
                    $app.dialog.modal({
                        action: action,
                        template: require("../views/workflow/design/category.publish.html"),
                        controller: require("./workflow").category.publish($app),
                        resolve: {
                            action: action,
                            input: action == "modify" ? node : {},
                            categories: categories,
                            expandedCategories: $scope.expandedCategories,
                            refresh: refresh
                        }
                    });
                }
                // 新增流程
                $scope.addProcess = function () {
                    $app.dialog.modal({
                        title: "新增流程",
                        width: 760,
                        template: require("../views/workflow/design/process.publish.html"),
                        controller: require("./workflow").design.publish($app),
                        resolve: {
                            input: {},
                            categories: categories,
                            expandedCategories: $scope.expandedCategories,
                            refresh: refresh
                        }
                    });
                }
                $scope.onDbSelection = function (node) {
                    if (node.node.id == "-1") {
                        $app.dialog.error({message: "跟目录禁止编辑"});
                    } else if (node.node.isCategory == 1) {
                        node.node.path = node.$path().map(function (path) {
                            return path.name;
                        }).reverse().join(" > ");
                        $scope.publishCategory("modify", node.node)
                    }
                }
                $scope.onSelection = function (node) {
                    if (node.node.isCategory != 2 || !node.selected) {
                        $app.router.go("management.workflow.design.index");
                    } else {
                        // 加载流程编辑页
                        $app.router.go("management.workflow.design.basic", {id: node.node.id});
                    }
                }

                // 记录流程目录展开状态
                $scope.$watch("expandedCategories", function (expandes) {
                    $app.cookie.set({
                        name: "ys-wf-design-expanded-status",
                        value: expandes.map(function (category) {
                            return category.id;
                        }).join(",")
                    });
                }, true)
            }];
        },
        // 基础信息
        basic: function ($app) {
            return ["$scope", "$state", "$q", "$timeout", "$element", "$response", "WorkflowService", function ($scope, $state, $q, $timeout, $element, $response, workflowService) {
                var process = $scope.process = $response.process;

                $scope.selectCategory = $app.lazyExecute({
                    promise: function () {
                        return workflowService.quickCategory().then(function ($response) {
                            var defer = $q.defer();
                            defer.resolve($app.buildOption($response.data.data, true, function (item) {
                                return item.isCategory == 1;
                            }));
                            return defer.promise;
                        });
                    }, trigger: function (categorys) {
                        $app.dialog.tree({
                            title: "流程目录",
                            items: categorys, values: [process.categoryId]
                        }).then(function (result) {
                            if (result.execute) {
                                angular.forEach(result.values, function (value) {
                                    process.categoryId = value.id;
                                    process.path = value.path;
                                })
                            }
                        })
                    }
                })
                $scope.copy = function () {
                    $app.dialog.modal({
                        width: 760, title: "复制为新流程",
                        template: require("../views/workflow/design/process.publish.html"),
                        controller: require("./workflow").design.copy($app),
                        resolve: {
                            action: "copy",
                            processId: process.id,
                            input: {
                                name: process.name,
                                isEnabled: process.isEnabled,
                                sequence: process.sequence
                            },
                            categories: $scope.$parent.categories,
                            expandedCategories: $scope.$parent.expandedCategories,
                            refresh: $scope.$parent.refresh
                        }
                    })
                }
                $scope.submit = function () {
                    $app.loading(true);
                    workflowService.publishProcess(angular.toJson(process)).then(function ($response) {
                        if ($response.data.success) {
                            process.id = $response.data.data;
                            $app.tip.success({message: "操作完成"});
                            $scope.$parent.refresh();
                        } else {
                            process.errorCode = $response.data.code;
                            $app.tip.error({message: $response.data.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
                $scope.drop = function () {
                    $app.dialog.confirm({message: "您正在删除流程<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                        if (result.execute) {
                            $app.loading(true);
                            workflowService.dropProcess(process.id).then(function ($response) {
                                if ($response.data.success) {
                                    $scope.$parent.$parent.refresh();
                                    $app.tip.success({message: "操作完成"});
                                    $state.go("management.workflow.design.index");
                                } else {
                                    $app.tip.error({message: $response.data.message});
                                }
                            }).finally(function () {
                                $app.loading(false);
                            })
                        }
                    })
                }
            }];
        },
        // 流程图编辑
        diagram: function ($app) {
            return ["$scope", "$response", "$timeout", "$element", "WorkflowService", function ($scope, $response, $timeout, $element, workflowService) {
                var $container = $app.$($element).find(".ys-workflow-design-diagram-container"),
                    process = $scope.process = $response.process;
                // 加载流程图设计器
                $app.loading(true);
                $app.$("<iframe/>", {
                    src: $app.getDynamicUrl("scripts/support/plugins/workflow/editor.html?modelId=" + $response.modelId),
                    scrolling: "no",
                    border: 0,
                    style: "padding:0;margin:0px;float:left;width: 100%;border:0px solid #000;height: calc(100vh - 163px)"
                }).on("load", function () {
                    $timeout(function () {
                        $app.loading(false);
                    })
                }).appendTo($container)

                // 注册全局事件、供流程设计器内angular程序调用
                // autoDestroyEvent 函数会在 $scope销毁时一并销毁全局事件
                $app.tools.ade($scope, [
                    // 获取设计器 SaveModel 函数 引用
                    $app.event.subscribe("/workflow/set/saveRef", function (event, data) {
                        $scope.saveModel = data.save;
                    }),
                    // 保存、部署流程
                    $app.event.subscribe("/workflow/process/save", function (event, data) {
                        $timeout(function () {
                            // $app.loading(true);
                            workflowService.publishModel(angular.toJson(data.params)).then(function ($response) {
                                if ($response.data.success) {
                                    // $app.tip.success({message: "保存完成"});
                                    workflowService.deploymentModelByProcessId(process.id).then(function ($response) {
                                        if ($response.data.success) {
                                            $app.tip.success({message: "部署成功已生效！"});
                                        } else {
                                            $app.dialog.error({
                                                /*"流程部署失败！<br/>" +*/
                                                message: $response.data.message, buttons: [
                                                    {text: "知道啦"}
                                                ]
                                            });
                                        }
                                    }).finally(function () {
                                        $app.loading(false);
                                    })
                                }
                            }).finally(function () {
                                // $app.loading(false);
                            })
                        })
                    }),
                    $app.event.subscribe("/workflow/set/toggleFullscreen", function (event, data) {
                        $container.toggleClass("fullscreen")
                    }),
                    // 挂载表单
                    $app.event.subscribe("/workflow/process/form/selected", function (event, data) {
                        workflowService.findFormByProcessId(process.id).then(function ($response) {
                            $app.dialog.simpleSelector({
                                title: "挂载表单",
                                items: $response.data.data.map(function (form) {
                                    return {id: form.id, name: form.name};
                                }), values: [{id: data.formId}]
                            }).then(function (resrult) {
                                data.deferred.resolve(resrult);
                            })
                        })
                    }),
                    // 分配审批人
                    $app.event.subscribe("/workflow/process/identity", function (event, data) {
                        $app.dialog.modal({
                            title: "分配审批人",
                            items: [], values: [], single: true, width: 600,
                            template: require("../views/workflow/design/identity.pos.selector.html"),
                            controller: require("./workflow").design.identityPosSelector($app),
                            resolve: {
                                input: angular.extend({typeId: 1001, pos: []}, data.identity)
                            }
                        }).then(function (result) {
                            data.deferred.resolve(result);
                        })
                    })
                ]);

                // 部署流程
                $scope.deployment = function () {
                    $app.loading(true)
                    $scope.saveModel()
                    /*workflowService.deploymentModelByProcessId(process.id).then(function ($response) {
                     if ($response.data.success) {
                     $app.tip.success({message: "流程部署成功已生效"});
                     } else {
                     $app.dialog.error({message: $response.data.message});
                     }
                     }).finally(function () {
                     $app.loading(false);
                     })*/
                }
            }];
        },
        // 表单管理
        form: function ($app) {
            return ["$scope", "$response", "$timeout", "$element", "WorkflowService", function ($scope, $response, $timeout, $element, workflowService) {
                var $el = $app.$($element),
                    process = $scope.process = $response.process,
                    forms = $scope.forms = $response.forms || [],
                    input = $scope.input = forms.filter(function (item) {
                        return item.nodeId == "global" ? item : undefined;
                    })[0];
                if (!forms.length) {
                    $app.router.go("management.workflow.design.process.diagram", {id: process.id});
                    $app.dialog.error({message: "尚未部署流程！"});
                }
                $scope.modify = function (form) {
                    input = $scope.input = form;
                }
                $scope.cancel = function () {
                    input = $scope.input = undefined;
                }
                $scope.refresh = function () {
                    $app.loading(true);
                    workflowService.findFormByProcessId(process.id).then(function ($response) {
                        forms = $scope.forms = $response.data.data;
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
                $scope.toggleFormEnabledStatus = function (form) {
                    try {
                        $app.assert(!form.id, "表单不存在、请保存后在操作！");
                        $app.assert(form.nodeId == 'global', "全局表单不能禁用！");
                        $app.loading(true);
                        workflowService.toggleFormEnabledStatus(form.id).then(function ($response) {
                            if ($response.data.success) {
                                if (form.enabled == 1) {
                                    $app.tip.success({message: $app.data.format("【{0}】定制表单已禁用！", form.nodeName)});
                                } else {
                                    $app.tip.success({message: $app.data.format("【{0}】定制表单已启用！", form.nodeName)});
                                }
                                $scope.refresh();
                            } else {
                                $app.dialog.error({message: $response.data.message});
                            }
                        }).finally(function () {
                            $app.loading(false);
                        })
                    } catch (ex) {
                        $app.dialog.error({message: ex.message});
                    }
                }
                $scope.submit = function () {
                    $app.loading(true);
                    workflowService.publishForm(angular.toJson(angular.extend({processId: process.id}, input))).then(function ($response) {
                        if ($response.data.success) {
                            $scope.refresh();
                            input.id = $response.data.data;
                            $app.tip.success({message: "操作完成"});
                        } else {
                            input.errorCode = $response.data.code;
                            $app.tip.error({message: $response.data.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
                $scope.drop = function () {
                    $app.dialog.confirm({message: "您正在删除表单信息<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                        if (result.execute) {
                            $app.loading(true);
                            workflowService.dropForm(input.id).then(function ($response) {
                                if ($response.data.success) {
                                    input = $scope.input = undefined;
                                    $app.tip.success({message: "操作完成"});
                                    $scope.refresh();
                                } else {
                                    $app.dialog.error({message: $response.data.message});
                                }
                            }).finally(function () {
                                $app.loading(false);
                            })
                        }
                    })
                }
                $scope.showSampleCode = function (action) {
                    $app.dialog.modal({
                        width: 730,
                        template: require("../views/workflow/design/form.sample.html"),
                        controller: ["$scope", "action", function ($scope, action) {
                            $scope.action = action;
                            $scope.use = function () {
                                if (action == "html") {
                                    if (!input.template) {
                                        input.template = "<div class=\"col-xs-12\">\n" +
                                            "    <div class=\"col-xs-12\">\n" +
                                            "        <div class=\"col-xs-4\">真实姓名</div>\n" +
                                            "        <div class=\"col-xs-8\"><input type=\"text\" class=\"form-control\" ng-model=\"input.realname\"/></div>\n" +
                                            "    </div>\n" +
                                            "</div>";
                                        $scope.close();
                                    } else {
                                        $app.dialog.error({message: "为防止误操作、请先手动清空表单内的数据！"});
                                    }
                                } else {
                                    if (!input.script) {
                                        input.script = "[\"$scope\",\"$element\",\"ProjectService\",function($scope,$element,projectService){\n" +
                                            "    var input=$scope.input={realname:\"戴章铭\",nickname:\"小菊\"};\n" +
                                            "    $scope.submit=function(){\n" +
                                            "        try{\n" +
                                            "            $app.assert(input.realname,\"未输入真实姓名！\");\n" +
                                            "            // ~~~~ 请求服务器 post 数据\n" +
                                            "            $app.tip.success({message:\"操作成功！\"});\n" +
                                            "        }catch(ex){\n" +
                                            "            $app.tip.error({message:ex.message});\n" +
                                            "        }\n" +
                                            "    }\n" +
                                            "}]";
                                        $scope.close();
                                    } else {
                                        $app.dialog.error({message: "为防止误操作、请先手动清空表单内的数据！"});
                                    }
                                }

                            }
                        }], resolve: {
                            action: action
                        }
                    })
                }
            }];
        },
        // 审批人
        user: function ($app) {
            return ["$scope", "$response", "$timeout", "$element", "WorkflowService", function ($scope, $response, $timeout, $element, workflowService) {
                var $el = $app.$($element),
                    process = $scope.process = $response.process,
                    nodes = $scope.nodes = $response.nodes || [],
                    input = $scope.input = nodes.filter(function (item) {
                        return item.key == "global" ? item : undefined;
                    })[0];

                $scope.modify = function (form) {
                    input = $scope.input = form;
                }
                $scope.cancel = function () {
                    input = $scope.input = undefined;
                }
                $scope.refresh = function () {
                    $app.loading(true);
                    workflowService.findFormByProcessId(process.id).then(function ($response) {
                        forms = $scope.forms = $response.data.data;
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
                $scope.toggleFormEnabledStatus = function (form) {
                    try {
                        $app.assert(!form.id, "表单不存在、请保存后在操作！");
                        $app.assert(form.key == 'global', "全局表单不能禁用！");
                        $app.loading(true);
                        workflowService.toggleFormEnabledStatus(form.id).then(function ($response) {
                            if ($response.data.success) {
                                if (form.enabled == 1) {
                                    $app.tip.success({message: $app.data.format("【{0}】定制表单已禁用！", form.name)});
                                } else {
                                    $app.tip.success({message: $app.data.format("【{0}】定制表单已启用！", form.name)});
                                }
                                $scope.refresh();
                            } else {
                                $app.dialog.error({message: $response.data.message});
                            }
                        }).finally(function () {
                            $app.loading(false);
                        })
                    } catch (ex) {
                        $app.dialog.error({message: ex.message});
                    }
                }
                $scope.submit = function () {
                    $app.loading(true);
                    workflowService.publishForm(angular.toJson(angular.extend({processId: process.id}, input))).then(function ($response) {
                        if ($response.data.success) {
                            $scope.refresh();
                            input.id = $response.data.data;
                            $app.tip.success({message: "操作完成"});
                        } else {
                            input.errorCode = $response.data.code;
                            $app.tip.error({message: $response.data.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
                $scope.drop = function () {
                    $app.dialog.confirm({message: "您正在删除表单信息<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                        if (result.execute) {
                            $app.loading(true);
                            workflowService.dropForm(input.id).then(function ($response) {
                                if ($response.data.success) {
                                    input = $scope.input = undefined;
                                    $app.tip.success({message: "操作完成"});
                                    $scope.refresh();
                                } else {
                                    $app.dialog.error({message: $response.data.message});
                                }
                            }).finally(function () {
                                $app.loading(false);
                            })
                        }
                    })
                }
                $scope.showSampleCode = function (action) {
                    $app.dialog.modal({
                        width: 730,
                        template: require("../views/workflow/design/form.sample.html"),
                        controller: ["$scope", "action", function ($scope, action) {
                            $scope.action = action;
                            $scope.use = function () {
                                if (action == "html") {
                                    if (!input.template) {
                                        input.template = "<div class=\"col-xs-12\">\n" +
                                            "    <div class=\"col-xs-12\">\n" +
                                            "        <div class=\"col-xs-4\">真实姓名</div>\n" +
                                            "        <div class=\"col-xs-8\"><input type=\"text\" class=\"form-control\" ng-model=\"input.realname\"/></div>\n" +
                                            "    </div>\n" +
                                            "</div>";
                                        $scope.close();
                                    } else {
                                        $app.dialog.error({message: "为防止误操作、请先手动清空表单内的数据！"});
                                    }
                                } else {
                                    if (!input.script) {
                                        input.script = "[\"$scope\",\"$element\",\"ProjectService\",function($scope,$element,projectService){\n" +
                                            "    var input=$scope.input={realname:\"戴章铭\",nickname:\"小菊\"};\n" +
                                            "    $scope.submit=function(){\n" +
                                            "        try{\n" +
                                            "            $app.assert(input.realname,\"未输入真实姓名！\");\n" +
                                            "            // ~~~~ 请求服务器 post 数据\n" +
                                            "            $app.tip.success({message:\"操作成功！\"});\n" +
                                            "        }catch(ex){\n" +
                                            "            $app.tip.error({message:ex.message});\n" +
                                            "        }\n" +
                                            "    }\n" +
                                            "}]";
                                        $scope.close();
                                    } else {
                                        $app.dialog.error({message: "为防止误操作、请先手动清空表单内的数据！"});
                                    }
                                }

                            }
                        }], resolve: {
                            action: action
                        }
                    })
                }
            }];
        },
        // 节点管理
        node: function ($app) {
            return ["$scope", "$response", "$timeout", "$element", "WorkflowService", function ($scope, $response, $timeout, $element, workflowService) {
                var nodes = $scope.nodes = $response.nodes,
                    input = $scope.input = nodes.options.filter(function (node) {
                        node.operation = "base";
                        node.config = angular.extend({
                            isAllowRecover: 1,
                            isAllowDrop: 1,
                            isSkipSameUser: 2,
                            isShowDiagram: 2,
                            isAllowPrint: 1,
                            isShowOpinion: 2,
                            notify: [1001],
                            // 会签配置
                            multi: {
                                // 投票结果 1001通过、1002拒绝
                                voteResultTypeId: 1001,
                                // 投票结果满足时 1001流转下一环节、1002等待投票完成
                                handleTypeId: 1001,
                                // 投票计算类型 1001票数、1002百分比
                                voteCalTypeId: 1001,
                                // 特权用户
                                privileges: []
                            }
                        }, node.config);
                        return node.type == "userTask";
                    })[0];
                nodes.root = nodes.hash["main"];
                $scope.expandedNodes = [nodes.root];
                $scope.selectedNode = input;
                $scope.nodeOptions = {}
                $scope.onSelection = function (node) {
                    if (node.node.type == "userTask") {
                        input = $scope.input = node.node;
                        input.operation = input.operation ? input.operation : "multiple";
                    } else {
                        input = $scope.input = undefined;
                    }
                }
                // 允许追回
                $scope.setRecover = function () {
                    input.config.isAllowRecover = input.config.isAllowRecover == 1 ? 2 : 1;
                }
                // 允许发起人删除
                $scope.setDrop = function () {
                    input.config.isAllowDrop = input.config.isAllowDrop == 1 ? 2 : 1;
                }
                // 相同审批人则跳过
                $scope.setSkipSameUser = function () {
                    input.config.isSkipSameUser = input.config.isSkipSameUser == 1 ? 2 : 1;
                }
                $scope.setDiagram = function () {
                    input.config.isShowDiagram = input.config.isShowDiagram == 1 ? 2 : 1;
                }
                $scope.setPrint = function () {
                    input.config.isAllowPrint = input.config.isAllowPrint == 1 ? 2 : 1;
                }
                $scope.setOpinion = function () {
                    input.config.isShowOpinion = input.config.isShowOpinion == 1 ? 2 : 1;
                }
                $scope.setNotify = function (value) {
                    if (input.config.notify.indexOf(value) != -1) {
                        input.config.notify = input.config.notify.filter(function (item) {
                            return item != value;
                        });
                    } else {
                        input.config.notify.push(value);
                    }

                }
                $scope.inNotify = function (value) {
                    return input.config.notify.filter(function (item) {
                            return item == value;
                        }).length > 0;
                }
                // 添加特权人员
                $scope.addPrivilege = function () {
                    $app.dialog.modal({
                        template: require("../views/workflow/design/add.privilege.html"),
                        controller: ["$scope", function ($scope) {
                            var option = $scope.option, input = $scope.input = {};
                            $scope.setUser = function () {
                                $app.dialog.user({title: "选择特权人员"}).then(function (result) {
                                    if (result.execute) {
                                        angular.forEach(result.values, function (user) {
                                            input.userId = user.id;
                                            input.realname = user.realname;
                                        })
                                    }
                                })
                            }
                            $scope.submit = function () {
                                try {
                                    if (!input.userId) {
                                        input.errorCode = 9001;
                                        $app.assert(true, "未选择人员！");
                                    }
                                    if (!input.voteNumber) {
                                        input.errorCode = 9002;
                                        $app.assert(true, "未填写票数！");
                                    }
                                    $scope.close(function () {
                                        option.deferred.resolve({execute: true, values: [input]});
                                    })
                                } catch (ex) {
                                    $app.dialog.error({message: ex.message});
                                }
                            }
                        }]
                    }).then(function (result) {
                        if (!input.config.multi.privileges) {
                            input.config.multi.privileges = [];
                        }
                        if (result.execute) {
                            if (input.config.multi.privileges.filter(function (user) {
                                    return user.userId == result.values[0].userId;
                                }).length > 0) {
                                $app.tip.error({message: "特权人员已存在、请删除后在添加！"});
                            } else {
                                input.config.multi.privileges.push(result.values[0]);
                                $app.tip.success({message: "添加成功、保存后生效！"});
                            }
                        }
                    })
                }
                // 删除特权人员
                $scope.dropPrivilege = function (privilege) {
                    input.config.multi.privileges = input.config.multi.privileges.filter(function (item) {
                        return item != privilege;
                    })
                }

                $scope.submit = function () {
                    $app.loading(true);
                    workflowService.publishNode({
                        processId: $app.router.params.id,
                        nodeId: input.id,
                        nodeName: input.name,
                        config: input.config
                    }).then(function ($response) {
                        if ($response.data.success) {
                            $app.tip.success({message: "操作完成"});
                        } else {
                            $app.dialog.error({message: $response.data.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
            }];
        },
        // 职位选择
        identityPosSelector: function ($app) {
            return ["$scope", "input", function ($scope, input) {
                var option = $scope.option, utos = $scope.utos = {
                    single: true,
                    containerCssClass: 'require',
                    data: $app.dictionary.WORKFLOW_APPROVAL_USER_TYPE.options
                }, input = $scope.input = input;
                $scope.userNames = function () {
                    return input.pos.map(function (pos) {
                        return pos.name;
                    }).join(",");
                }

                // 职位选择
                $scope.pos = function () {
                    $app.dialog.pos({
                        title: "选择职位", single: false, values: input.pos.map(function (pos) {
                            return pos.id;
                        })
                    }).then(function (result) {
                        input.pos = [];
                        angular.forEach(result.values, function (pos) {
                            input.pos.push({id: pos.id, name: pos.name});

                        })
                    })
                }
                $scope.submit = function (execute) {
                    if (execute && input.typeId == "1002"/*固定职位必须给定人员*/ && !input.pos.length) {
                        $app.dialog.error({message: "固定职位必选、不能为空！"})
                        return;
                    }
                    if (input.typeId != "1002") {
                        input.pos = [];
                    }
                    $scope.close(function () {
                        option.deferred.resolve({execute: execute, values: input});
                    })
                }
            }]
        },

        // 发布流程
        publish: function ($app) {
            return ["$scope", "$q", "categories", "input", "expandedCategories", "WorkflowService", "refresh", function ($scope, $q, categories, input, expandedCategories, workflowService, refresh) {
                var input = $scope.input = angular.extend({isEnabled: 1}, input);
                $scope.categories = categories;
                $scope.selectCategory = $app.lazyExecute({
                    promise: function () {
                        return workflowService.quickCategory().then(function ($response) {
                            var defer = $q.defer();
                            defer.resolve($app.buildOption($response.data.data, true, function (category) {
                                return category.isCategory == 1;
                            }));
                            return defer.promise;
                        });
                    }, trigger: function (categores) {
                        $app.dialog.tree({
                            title: "目录",
                            items: categores, values: [input.categoryId]
                        }).then(function (result) {
                            if (result.execute) {
                                angular.forEach(result.values, function (value) {
                                    input.categoryId = value.id;
                                })
                            }
                        })
                    }
                })
                $scope.submit = function () {
                    $app.loading(true);
                    workflowService.publishProcess(angular.toJson(input)).then(function ($response) {
                        if ($response.data.success) {
                            input.id = $response.data.data;
                            expandedCategories.push({id: input.id});
                            $app.tip.success({message: "操作完成"});
                            $scope.close(function () {
                                refresh();
                            })
                        } else {
                            input.errorCode = $response.data.code;
                            $app.tip.error({message: $response.data.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
            }];
        },
        // 目录管理
        category: function ($app) {
            return ["$scope", "$q", "input", "categories", "expandedCategories", "WorkflowService", "refresh", function ($scope, $q, input, categories, expandedCategories, workflowService, refresh) {
                var input = $scope.input = angular.extend({isEnabled: 1}, input);
                $scope.categories = categories;
                $scope.selectParentCategory = $app.lazyExecute({
                    promise: function () {
                        return workflowService.quickCategory().then(function ($response) {
                            var defer = $q.defer();
                            defer.resolve($app.buildOption($response.data.data, true, function (category) {
                                return category.isCategory == 1 && category.id != input.id;
                            }));
                            return defer.promise;
                        });
                    }, trigger: function (categores) {
                        $app.dialog.tree({
                            title: "目录",
                            items: categores,
                            values: [input.parentId]
                        }).then(function (result) {
                            if (result.execute) {
                                angular.forEach(result.values, function (value) {
                                    input.parentId = value.id;
                                })
                            }
                        })
                    }
                })
                $scope.submit = function () {
                    $app.loading(true);
                    workflowService.publishCategory(angular.toJson(input)).then(function ($response) {
                        if ($response.data.success) {
                            input.id = $response.data.data;
                            expandedCategories.push({id: input.id});
                            $app.tip.success({message: "操作完成"});
                            $scope.close(function () {
                                refresh();
                            })
                        } else {
                            input.errorCode = $response.data.code;
                            $app.tip.error({message: $response.data.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
                $scope.drop = function () {
                    $app.dialog.confirm({message: "您正在删除流程目录信息<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                        if (result.execute) {
                            $app.loading(true);
                            workflowService.dropCategory(input.id).then(function ($response) {
                                if ($response.data.success) {
                                    $app.tip.success({message: "操作完成"});
                                    $scope.close(function () {
                                        refresh();
                                    })
                                } else {
                                    $app.tip.error({message: $response.data.message});
                                }
                            }).finally(function () {
                                $app.loading(false);
                            })
                        }
                    })
                }
            }];
        },
        // 复制流程
        copy: function ($app) {
            return ["$scope", "$q", "input", "categories", "expandedCategories", "WorkflowService", "refresh", "processId", function ($scope, $q, input, categories, expandedCategories, workflowService, refresh, sourceProcessId) {
                var input = $scope.input = angular.extend({}, input);
                $scope.categories = categories;
                $scope.selectCategory = $app.lazyExecute({
                    promise: function () {
                        return workflowService.quickCategory().then(function ($response) {
                            var defer = $q.defer();
                            defer.resolve($app.buildOption($response.data.data, true, function (category) {
                                return category.isCategory == 1;
                            }));
                            return defer.promise;
                        });
                    }, trigger: function (categores) {
                        $app.dialog.tree({
                            title: "目录",
                            items: categores, values: [input.categoryId]
                        }).then(function (result) {
                            if (result.execute) {
                                angular.forEach(result.values, function (value) {
                                    input.categoryId = value.id;
                                })
                            }
                        })
                    }
                })

                $scope.submit = function () {
                    $app.loading(true);
                    workflowService.copyProcess(sourceProcessId, angular.toJson(input)).then(function ($response) {
                        if ($response.data.success) {
                            input.id = $response.data.data;
                            expandedCategories.push({id: input.id});
                            $app.tip.success({message: "操作完成"});
                            $scope.close(function () {
                                refresh();
                            })
                        } else {
                            input.errorCode = $response.data.code;
                            $app.tip.error({message: $response.data.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                }
            }];
        }
    }
}
