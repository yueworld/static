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
            '<svg ng-style="{}">' +
            '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="{{::link}}" svg-href="{{::name}}"></use>' +
            '</svg>' +
            '</i>',
            link: function ($scope, $element, $attr) {

            }
        };
    }];
    $app.directive("icon", IconDirective);
    $app.directive("ys-icon", IconDirective);
    var template = '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${link}" svg-href="${name}"></use></svg>';
    $app.directive("ysPlatformIcon", [function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs", "$location", function ($scope, $element, $attrs, $location) {
                var $el = $app.$($element),
                    option = $scope.ysPlatformIcon = $scope.$eval($attrs.ysPlatformIcon),
                    link = $app.platform.window ? $location.absUrl() + "#icon-" + option.name : "#icon-" + option.name;
                $el.css({width: option.width, height: option.height}).addClass("svg-container");
                $app.$($app.helper.template(template, {link: link, name: option.name})).css({
                    width: option.width,
                    height: option.height
                }).appendTo($el);
            }]
        };
    }]);
}