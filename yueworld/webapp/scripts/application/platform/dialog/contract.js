require("../views/contract.choose.scss")
module.exports = function ($app) {
    $app.contract = $app.contract || {};
    /**
     * 选择合同
     * @param option
     */
    $app.contract.dialog = {
        choose: function (option) {
            return $app.modal(angular.extend({
                class: "ys-platform-dropdown-contract-win",
                placeholder: "合同查询，请输入租户名、铺位号、合同号", width: 700,
                template: require("../views/contract.choose.html"),
                controller: ["$scope", "TenantService", "LeaseContService", function ($scope, tenantService, leaseContService) {
                    var option = $scope.option,
                        filter = $scope.filter = {},
                        projects = $scope.projects = [],
                        tenants = $scope.tenants = [],
                        contracts = $scope.contracts = [],
                        selectedTenant = $scope.selectedTenant = undefined,
                        selectedItem = $scope.selectedItem = undefined;
                    // 选择区域、加载项目
                    $scope.selectArea = function (item) {
                        filter.areaId = item.id;
                        filter.projectId = undefined;
                        filter.tenantId = undefined;
                        // filter.term = undefined;
                        selectedItem = $scope.selectedItem = undefined;
                        // 清空数据
                        projects = $scope.projects = [];
                        tenants = $scope.tenants = [];
                        contracts = $scope.contracts = [];
                        // 筛选项目
                        angular.forEach($app.dictionary.PROJECTS.options, function (item) {
                            if (filter.areaId == item.areaId) {
                                projects.push(item);
                            }
                        })
                    }
                    // 选择项目、加载商户
                    $scope.selectProject = function (item) {
                        filter.projectId = item.id;
                        filter.tenantId = undefined;
                        filter.contractId = undefined;
                        selectedTenant = $scope.selectedTenant = undefined;
                        selectedItem = $scope.selectedItem = undefined;
                        // 清空数据
                        tenants = $scope.tenants = [];
                        contracts = $scope.contracts = [];
                        // 筛选商户
                        // console.log(item)
                        if (filter.term) {
                            filter.reload = new Date().getTime();
                        } else {
                            $app.loading(true);
                            tenantService.quick(filter).then(function ($response) {
                                tenants = $scope.tenants = $response.data.data;
                            }).finally(function () {
                                $app.loading(false);
                            })
                        }
                    }
                    // 选择租户、加载合同
                    $scope.selectTenant = function (item) {
                        filter.tenantId = item.id;
                        selectedTenant = $scope.selectedTenant = item;
                        selectedItem = $scope.selectedItem = undefined;
                        // 清空数据
                        contracts = $scope.contracts = [];
                        $app.loading(true);
                        leaseContService.quick(filter).then(function ($response) {
                            contracts = $scope.contracts = $response.data.data;
                        }).finally(function () {
                            $app.loading(false);
                        })
                    }
                    $scope.selectContract = function (item) {
                        selectedItem = $scope.selectedItem = item;
                    }
                    $scope.$watch("filter.term+filter.reload", $app.helper.watch(function () {
                        selectedItem = $scope.selectedItem = undefined;
                        try {
                            $app.assert.isEmpty(filter.areaId, "请选择区域！");
                            $app.assert.isEmpty(filter.projectId, "请选择项目！");
                            if (filter.term) {
                                $app.loading(true);
                                leaseContService.quick({
                                    projectId: filter.projectId,
                                    term: filter.term
                                }).then(function ($response) {
                                    contracts = $scope.contracts = $response.data.data;
                                }).finally(function () {
                                    $app.loading(false);
                                })
                            } else if (selectedTenant) {
                                filter.tenantId = undefined;
                                $scope.selectTenant(selectedTenant)
                            } else {
                                contracts = $scope.contracts = [];
                            }
                        } catch (ex) {
                            $app.tip.error({message: ex.message});
                        }
                    }, 300))
                    $scope.submit = function (execute) {
                        $scope.close(function () {
                            option.deferred.resolve({execute: execute, values: [selectedItem]});
                        })
                    }
                }]
            }, option))
        }
    }
}