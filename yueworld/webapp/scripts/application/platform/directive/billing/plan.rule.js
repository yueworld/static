// 计租计划、费项规则
module.exports = function ($app) {
    var tempalte = require("../../views/billing/plan.rule.html"), plan = require("./data.js");
    $app.register.directive("ysPlatformBillingPlanRule", [function () {
        return {
            restrict: "AE", replace: true, transclude: true, controllerAs: "$ctrl",
            controller: ["$scope", "$compile", "$attrs", "$element", function (_$scope, $compile, $attrs, $element) {
                var self = this, tbody = $app.$("<tbody/>");
                angular.forEach(plan.fees, function (fee, feeIndex) {
                    angular.forEach(fee.rules, function (rule, ruleIndex) {
                        // 设置 分期 合并行数
                        rule.sectionsMergeSize = 0;
                        angular.forEach(rule.sections, function (section, sectionIndex) {
                            angular.forEach(section.cycles, function (cycle, cycleIndex) {
                                var $scope = angular.extend(_$scope.$new(), {
                                    fee: fee, feeIndex: feeIndex, rule: rule, ruleIndex: ruleIndex,
                                    section: section, sectionIndex: sectionIndex, cycle: cycle, cycleIndex: cycleIndex
                                });
                                tbody.append($compile($app.$(tempalte))($scope));
                            });
                            rule.sectionsMergeSize = rule.sectionsMergeSize + section.cycles.length;
                        })
                    });
                });
                $element.replaceWith(tbody);
            }]
        };
    }]);
}