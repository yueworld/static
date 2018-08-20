// 计费
module.exports = function ($app) {
    $app.register.directive("ysPlatformBillingPlanRuleCycle", [function () {
        return {
            restrict: "A", replace: true, transclude: true, controllerAs: "$ctrl",
            controller: ["$scope", "$compile", "$attrs", "$element", function (_$scope, $compile, $attrs, $element) {
                var $el = $app.$($element),
                    option = $scope.ysPlatformBillingPlanRuleCycle = angular.extend({algorithmId: 1001/*固定*/}, $scope.$eval($attrs.ysPlatformBillingPlanRuleCycle));

                $element.

                $element.replaceWith(tbody);
            }]
        };
    }]);
}