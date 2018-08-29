module.exports = function ($app) {
    // 引入模版
    $app.register.run(["$templateCache", function ($templateCache) {
        $templateCache.put("scripts/application/platform/views/icons.html", require("../views/icons.html"));
    }]);
    var template = '<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${link}" svg-href="${name}"></use></svg>';
    $app.register.directive("ysPlatformIcon", [function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs", "$location", function ($scope, $element, $attrs, $location) {
                var $el = $app.$($element),
                    defaults = $scope.$eval($attrs.ysPlatformIcon),
                    link = $app.platform.window ? $location.absUrl() + "#icon-" + defaults.name : "#icon-" + defaults.name;
                $el.css({width: defaults.width, height: defaults.height, display: "inline-block"}).addClass("svg-container");
                $app.$($app.helper.template(template, {link: link, name: defaults.name})).css({
                    width: defaults.width,
                    height: defaults.height
                }).appendTo($el);
            }]
        };
    }]);
}