/**
 * bootstrap.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-03-02 10:32:11
 * @description Bootstrap App
 */
// 初始化
window.$app = require("../../../../yueworld").bootstrap({
    loading: true,
    title: "示例、Simple",
    ready: function ($app) {
        $app.loading(false);
    }
}, [function ($app) {
    $app.register.controller("MainController", ["$scope", "$q", "$timeout", function ($scope, $q, $timeout) {
        var self = this.init($scope, {
            input: {
                projectId: undefined,
                layoutId: undefined,
                paymentUnitIds: undefined,
                tenantIds: undefined
            }
        });
        var company = [
            {id: "1001", text: "上海悦商信息科技有限公司"},
            {id: "1002", text: "上海万科商业地产公司"}
        ];
        $scope.quickSearchCompany = function (filter, option) {
            return $app.helper.promise(function () {
                return company.filter(function (item) {
                    return !filter.term || item.text.indexOf(filter.term) != -1;
                })
            })
        };
    }])
}])