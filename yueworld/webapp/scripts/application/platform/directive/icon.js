module.exports = function ($app) {
    $app.run(["$templateCache", function ($templateCache) {
        $templateCache.put("scripts/application/platform/views/icons.html", require("../views/icons.html"));
    }]);
    // var baseHref = window.location.href;
    var IconDirective = ["$rootScope", "$location", function ($rootScope, $location) {
        return {
            restrict: "E",
            replace: false,
            scope: {'name': '@', 'width': '@', 'height': '@'},
            template: '' +
            '<i class="svg-container">' +
            '<svg ng-style="{width:width,height:height}">' +
            '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="{{::link}}" svg-href="{{::name}}"></use>' +
            '</svg>' +
            '</i>',
            link: function ($scope, $element, $attr) {
                if ($app.platform.window) {
                    $scope.link = $location.absUrl() + "#icon-" + $attr.name;
                } else {
                    $scope.link = "#icon-" + $attr.name;
                }
            }
        };
    }];
    $app.directive("icon", IconDirective);
    $app.directive("ys-icon", IconDirective);
}