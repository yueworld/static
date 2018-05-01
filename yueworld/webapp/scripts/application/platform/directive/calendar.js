module.exports = function ($app) {
    $app.directive("ywCalendar", ["$timeout", function ($timeout) {
        return {
            restrict: "AE",
            replace: true,
            scope: {
                ywCalendar: "=",
                showHead: "=",
                viewStyle: "=",/* 1日、2月*/
            },
            transclude: true,
            template: "<div class='ys-calendar' id='calendar'>" +
            "<table class='table table-bordered mb0' ng-if='!viewStyle||viewStyle==1'>" +
            "   <head><tr ng-if='!hideHead'><th class='bg-gray text-center'>日</th><th class='bg-gray text-center'>一</th><th class='bg-gray text-center'>二</th><th class='bg-gray text-center'>三</th><th class='bg-gray text-center'>四</th><th class='bg-gray text-center'>五</th><th class='bg-gray text-center'>六</th></tr></head>" +
            "   <tbody>" +
            "       <tr ng-repeat='dates in weeks'>" +
            "           <td ng-repeat='date in dates' ng-transclude ng-class='{\"bg-gray\":!date.isMonth}' ng-click='active($event)'></td>" +
            "       </tr>" +
            "   </tbody>" +
            "</table>" +
            "<table class='table table-bordered mb0' ng-if='viewStyle==2'>" +
            "   <tr ng-repeat='months in quarter'>" +
            "       <td ng-repeat='month in months' ng-transclude></td>" +
            "   </tr>" +
            "</table>" +
            "</div>",
            controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
                var $el = $app.$($element), weeks = $scope.weeks = [], cDay = $app.date.format(new Date(), "yyyyMMdd");
                $scope.$app = $app;
                $scope.$watch("ywCalendar.getTime()+viewStyle", function (nv) {
                    // 按日显示
                    if (!$scope.viewStyle || $scope.viewStyle == 1) {
                        var weeks = $scope.weeks = [], nv = /\d+/.test($scope.ywCalendar) ? new Date(Number($scope.ywCalendar)) : $scope.ywCalendar;
                        var _year = nv.getFullYear(), _month = nv.getMonth() + 1;
                        var firstDay = new Date(_year, _month - 1, 1), // 当前月第一天
                            cMonth = $app.date.format(nv, "yyyyMM");
                        for (var i = 0; i < 5; i++) {
                            var days = [];
                            for (var d = 0; d < 7; d++) {
                                var date = new Date(_year, _month - 1, (i * 7) + d + 1 - firstDay.getDay());
                                days.push({
                                    date: date,
                                    month: $app.date.format(date, "MM"),
                                    day: $app.date.format(date, "dd"),
                                    isToday: cDay == $app.date.format(date, "yyyyMMdd"),
                                    isMonth: cMonth == $app.date.format(date, "yyyyMM"),
                                })
                            }
                            weeks.push(days);
                        }
                    }
                    // 按月显示
                    else if ($scope.viewStyle == 2) {
                        $scope.quarter = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
                    }
                }, true)
                // 激活
                $scope.active = function ($event) {
                    $app.$($event.target).parents("table").find(".active").removeClass("active");
                    $app.$($event.currentTarget).addClass("active");
                }
            }]
        };
    }]);
}