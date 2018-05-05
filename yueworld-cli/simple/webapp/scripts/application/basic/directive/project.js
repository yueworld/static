module.exports = function ($app) {
    // Directive
    $app.directive("projectPublish", ["$timeout", "$q", "ProjectService", function ($timeout, $q, projectService) {
        return {
            restrict: "AE", replace: true, transclude: true,
            template: require("../views/project/project.publish.html"),
            scope: {
                "model": "=", "pager": "=", "refresh": "&"
            }, link: function ($scope, $element) {
                $app.$($element).find("tr:first").replaceWith($app.$($element).find("tr.rs"));
                var input = $scope.input = $scope.model ? $scope.model : {
                    charges: [{}], partys: [{}]
                };
                input.isEdit = true;
                $scope.setOrganization = function () {
                    $app.platform.organization.choose({values: [input.orgId]}).then(function (result) {
                        if (result.execute) {
                            angular.forEach(result.values, function (value) {
                                input.orgId = value.id;
                                input.orgName = value.name;
                            })
                        }
                    });
                }
                // 商铺产权性质
                $scope.prnos = {
                    single: true,
                    placeholder: '-- 请选择 --',
                    containerCssClass: 'require',
                    // data: $app.dictionary.PROPERTY_NATURE.options
                }
                // 甲方抬头
                $scope.headOptions = {
                    placeholder: '-- 请选择 --', containerCssClass: 'require', select: function (selected) {
                        angular.forEach(input.partys, function (party) {
                            if (party.headId == selected.id) {
                                party.head = {address: selected.address, tel: selected.tel}
                            }
                        })
                    }
                }
                // 银行账号
                $scope.bankOptions = {
                    placeholder: '-- 请选择 --',
                    containerCssClass: 'require',
                    select: function (selected) {
                        angular.forEach(input.partys, function (party) {
                            if (party.bankId == selected.id) {
                                party.bank = {companyName: selected.companyName, bankName: selected.bankName}
                            }
                        })
                    }
                }
                /*bankService.quick().then(function ($response) {
                    $scope.bankOptions.data = $response.data.data;
                })*/
                $scope.addParty = function () {
                    input.partys.push({});
                    $scope.resize();
                }
                $scope.subtractParty = function (party) {
                    input.partys.remove(party);
                }
                // logo上传配置
                $scope.logos = {
                    single: true,
                    category: "PROJECT_LOGO",
                    targetId: input.id,
                    complete: function (attachment) {
                        input.logo = {path: attachment.path};
                        if (!attachment.targetId) {
                            input.logoId = attachment.id;
                        }
                    }
                }
                $scope.addCharge = function () {
                    input.charges.push({});
                }
                $scope.subtractCharge = function (charge) {
                    input.charges.remove(charge);
                }
                $scope.setUser = function (charge) {
                    $app.platform.user.choose({title: "选择项目负责人", values: [charge.userId]}).then(function (resrult) {
                        if (resrult.execute) {
                            if (resrult.values.length) {
                                charge.userId = resrult.values[0].id;
                                charge.realname = resrult.values[0].realname;
                            } else {
                                charge.userId = charge.realname = undefined;
                            }
                        }
                    })
                }
                // 注册提交事件
                $app.form.bind($scope, "submit", {
                    invoke: function () {
                        return projectService.publish(angular.toJson(input));
                    }
                });
            }
        };
    }]);
}