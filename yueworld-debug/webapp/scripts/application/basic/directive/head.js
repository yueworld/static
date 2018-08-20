module.exports = function ($app) {
    // Directive
    $app.register.directive("headPublish", ["$timeout", "HeadService", function ($timeout, headService) {
        return {
            restrict: "A", replace: true, transclude: true,
            template: require("../views/head/head.publish.html"),
            scope: {
                "model": "=", "pager": "=", "refresh": "&"
            }, link: function ($scope, $element) {
                var input = $scope.input = $scope.model ? $scope.model : {};
                input.isEdit = true;
                $app.$($element).find("tr:first").replaceWith($app.$($element).find("tr.rs"));
                // 注册提交事件
                $app.form.bind($scope, "submit", {
                    invoke: function () {
                        return headService.publish(angular.toJson(input));
                    }
                });
            }
        };
    }]);
}