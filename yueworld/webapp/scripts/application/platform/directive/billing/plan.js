// 计租计划
module.exports = function ($app) {
    require("../../views/billing/plan.scss");
    $app.register.directive("ysPlatformBillingPlan", [function () {
        return {
            restrict: "AE", replace: true, transclude: true,
            template: require("../../views/billing/plan.html"), controllerAs: "$ctrl",
            controller: ["$scope", "$compile", "$attrs", "$element", function (_$scope, $compile, $attrs, $element) {
                var self = this, input = self.input = require("./data.js");
                // console.log(input)
            }]
        };
    }]);
}