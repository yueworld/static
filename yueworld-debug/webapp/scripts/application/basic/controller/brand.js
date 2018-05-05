module.exports = {
    default: function ($app) {
        return ["$scope", "$state", function ($scope, $state) {
            var foldingStatus = $scope.foldingStatus = $app.cookie.get("ys-basic-brand-folding-status", "2"),
                // 业态展开状态
                ysBasicBrandExpandedStatus = $app.cookie.get("ys-basic-brand-expanded-status", "").split(","),
                filter = $scope.filter = $app.helper.extend({likeNameTemp: $state.params ? $state.params.likeName : ""}, $state.params, true);
            // 全屏
            $scope.folding = function () {
                $app.cookie.set({
                    name: "ys-basic-brand-folding-status",
                    value: foldingStatus = $scope.foldingStatus = ( $scope.foldingStatus == "2" ? "1" : "2")
                });
            };
            $scope.expandedLayouts = $app.dictionary.LAYOUTS.options.filter(function (layout) {
                return layout.id == "-1" || ysBasicBrandExpandedStatus.indexOf(layout.id) != -1
            });
            $scope.selectedNode = $app.dictionary.LAYOUTS.options.some(function (layout) {
                return layout.id == $app.router.params.layoutId;
            }) ? $app.dictionary.LAYOUTS.options.filter(function (category) {
                return category.id == $app.router.params.layoutId
            })[0] : $app.dictionary.LAYOUTS.root;
            // 记录目录展开状态
            $scope.$watch("expandedLayouts", function (expandes) {
                $app.cookie.set({
                    name: "ys-basic-brand-expanded-status",
                    value: expandes.map(function (category) {
                        return category.id;
                    }).join(",")
                });
            }, true);
            $scope.onSelection = function (node) {
                filter.layoutId = node.selected && node.node.id != "-1" ? node.node.id : '';
            };
            // 刷新数据
            $scope.refresh = function () {
                return $state.go("basic.info.brand.index", filter, {reload: true});
            };
            $scope.$watch("filter.layoutId+filter.projectId+filter.likeName+filter.approvalStatusId+filter.page", function (n, o) {
                if (n != o) {
                    $scope.refresh()
                }
            });
        }]
    },
    // 首页
    index: function ($app) {
        return ["$scope", "$state", "$response", "$element", function ($scope, $state, $response, _$element) {
            var pager = $scope.pager = $response.brands, $element = $app.$(_$element);
            $scope.$watch("filter.likeNameTemp", $app.watch(function (n, o) {
                if (n != o) {
                    $scope.filter.likeName = n;
                }
            }, 300));
            // 选择项目
            $scope.setProject = function () {
                $app.dialog.project.choose({values: [$scope.filter.projectId]}).then(function (resutls) {
                    if (resutls.execute) {
                        if (resutls.values.length) {
                            angular.forEach(resutls.values, function (selected) {
                                $scope.filter.projectId = selected.id;
                            });
                        } else {
                            $scope.filter.projectId = undefined;
                        }
                    }
                })
            };
        }]
    },
    // 新增、修改
    publish: function ($app) {
        return ["$scope", "$response", "LayoutService", "BrandService", "AttachmentService", function ($scope, $response, layoutService, brandService, attachmentService) {
            var input = $scope.input = angular.extend({
                approvalStatusId: 1001,
                storeAttachments: [],
                qualityAttachments: [],
                trademarkAttachments: [],
                attachments: [],
                clerkName: $app.user.realname
            }, $response.detail);
            // 选择项目
            $scope.setProject = function () {
                $app.dialog.project.choose({values: [input.projectId]}).then(function (resutls) {
                    if (resutls.execute) {
                        angular.forEach(resutls.values, function (selected) {
                            input.projectId = selected.id;
                        });
                    }
                })
            };
            // 选择业态
            $scope.setLayout = function () {
                $app.dialog.layout.choose({values: [input.layoutId]}).then(function (result) {
                    if (result.execute) {
                        angular.forEach(result.values, function (value) {
                            input.layoutId = value.id;
                            input.layoutPath = value.path;
                        })
                    }
                })
            };
            // 租期要求
            $scope.eltcos = {single: true, placeholder: '请选择', data: $app.dictionary.BRAND_LEASE_CYCLE_DEMAND.options}

            // LOGO 上传配置
            $scope.logoAttachments = {
                single: true, category: "BRAND_LOGO_ATTACHMENT", targetId: input.id,
                complete: function (attachment) {
                    input.logoAttachment = attachment;
                }
            }
            // 门店图片 上传配置
            $scope.storeAttachments = {
                single: false, category: "BRAND_STORE_ATTACHMENT", targetId: input.id,
                complete: function (attachment) {
                    input.storeAttachments.push({id: attachment.id, path: attachment.path});
                }
            }
            // 商标注册证
            $scope.qualityAttachments = {
                single: false, category: "BRAND_QUALITY_ATTACHMENT", targetId: input.id,
                complete: function (attachment) {
                    input.qualityAttachments.push({id: attachment.id, path: attachment.path});
                }
            }
            // 商标注册证
            $scope.trademarkAttachments = {
                single: false, category: "BRAND_TRADEMARK_ATTACHMENT", targetId: input.id,
                complete: function (attachment) {
                    input.trademarkAttachments.push({id: attachment.id, path: attachment.path});
                }
            }
            $scope.showAttachments = function () {
                $app.dialog.attachment.manager({
                    targetId: input.id,
                    category: "BRAND_ATTACHMENT",
                    files: input.attachments
                });
            }
            $scope.submit = function (submitApproval/*提交审核*/) {
                $app.loading(true);
                input.errorCode = undefined;
                brandService.publish(angular.toJson(angular.extend({}, input, {approvalStatusId: !submitApproval ? 1001 : 1002}))).then(function ($response) {
                    if ($response.data.success) {
                        input = $scope.input = angular.extend(input, $response.data.data)
                        $app.tip.success({message: "操作完成"});
                    } else {
                        input.errorCode = $response.data.code;
                        $app.msgbox.error({message: $response.data.message});
                    }
                }).finally(function () {
                    $app.loading(false);
                })
            }
            $scope.drop = function () {
                $app.msgbox.confirm({message: "您正在删除品牌信息<br/>该操作不可恢复、确定执行？"}).then(function (result) {
                    if (result.execute) {
                        $app.loading(true);
                        brandService.drop(input.id).then(function ($response) {
                            var response = $response.data;
                            if (response.success) {
                                $app.tip.success({message: "操作完成"});
                                $scope.$parent.refresh();
                            } else {
                                $app.msgbox.error({message: response.message});
                            }
                        }).finally(function () {
                            $app.loading(false);
                        })
                    }
                })
            }
            // 审核逻辑
            $scope.approval = function (approvalStatusId) {
                var message = "";
                if (approvalStatusId == "1001") {
                    message = "您正在取消审核<br/>提交后不能修改、确定执行？";
                } else if (approvalStatusId == "1002") {
                    message = "您正在提交审核<br/>提交后不能修改、确定执行？"
                } else if (approvalStatusId == "1003") {
                    message = "您正在通过审核<br/>提交后不能修改、确定执行？";
                } else if (approvalStatusId == "1004") {
                    message = "您正在驳回提交<br/>提交后不能修改、确定执行？";
                }
                $app.msgbox.confirm({message: message}).then(function (result) {
                    if (result.execute) {
                        if (approvalStatusId == 1002) {
                            $scope.submit(true);
                        } else {
                            $app.loading(true);
                            brandService.approval({
                                id: input.id,
                                approvalStatusId: approvalStatusId
                            }).then(function ($response) {
                                if ($response.data.success) {
                                    input.approvalStatusId = approvalStatusId;
                                    $app.tip.success({message: "操作完成"});
                                } else {
                                    input.errorCode = $response.data.code;
                                    $app.msgbox.error({message: $response.data.message});
                                }
                            }).finally(function () {
                                $app.loading(false);
                            })
                        }
                    }
                })
            }
            // 删除附件
            $scope.dropAttachment = attachmentService.dropDispose;
            $scope.zoom = function (path) {
                $app.publish('/img/zoom', {path: path})
            }
        }]
    }
}
