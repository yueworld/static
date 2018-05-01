module.exports = function ($app) {
    $app.directive("ysImgZoom", [ function () {
        var org = {};
        return {
            restrict: "AE",
            replace: true,
            scope: {},
            template: "<div class='dialog-mask-layer ys-img-zoom' ng-if='active'>" +
            "<div class='col-xs-12 img'><img ng-src='{{$parent.option.path}}'/></div>" +
            "<div class='col-xs-12 quit'><div ng-click='$parent.close()'><icon name='error-1' width='50px' height='80px'></icon></div></div> " +
            "</div>",
            controller: ["$scope", function ($scope) {
                var option = $scope.option = {};
                $scope.close = function (callback) {
                    $scope.active = false;
                }
                $app.subscribe("/img/zoom", function (event, data) {
                    $scope.active = true;
                    option = $scope.option = angular.extend({}, data);
                });
            }]
        };
    }]);
}