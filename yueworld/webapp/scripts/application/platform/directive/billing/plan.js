// 计租计划
module.exports = function ($app) {
    require("../../views/billing/plan.scss");
    $app.register.directive("ysPlatformBillingPlan", [function () {
        return {
            restrict: "AE", replace: true, transclude: true,
            template: require("../../views/billing/plan.html"), controllerAs: "$ctrl",
            controller: ["$scope", "$compile", "$attrs", "$element", function ($scope, $compile, $attrs, $element) {
                var self = this,
                    input = $scope.input = self.input = angular.extend({isEdit: true}, require("./data.js"));
                // console.log(input)
            }]
        };
    }]);
}