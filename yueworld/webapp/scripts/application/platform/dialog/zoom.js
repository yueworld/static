require("../views/img.scss");
var template = require("../views/img.html");
module.exports = function ($app) {

    /**
     * 图片放大器
     * @param option
     */
    function zoom(option) {
        return $app.injector.invoke(["$rootScope", "$animate", "$timeout", "$compile", function ($rootScope, $animate, $timeout, $compile) {
            var // 新作用域
                $scope = $rootScope.$new(),
                $backdrop = $app.backdrop(),
                $container = $app.$(template), img;
            $scope.option = angular.extend({width: 600}, option);
            $scope.close = function ($callback) {
                $animate.removeClass($container, "in");
                $timeout(function () {
                    $backdrop.hide().then(function () {
                        if (angular.isFunction($callback)) {
                            $callback();
                        }
                        $scope.$destroy();
                    });
                }, 75)
            }
            $timeout(function () {
                $animate.addClass($container, "in");
            }, 75);
            $scope.$on("$destroy", function () {
                $container.remove();
            })

            function reset(width, height) {
                img.css({
                    width: width, height: height,
                    left: "calc((100vw - " + width + "px)/2)",
                    top: "calc((100vh - " + height + "px)/2)"
                })
            }

            $scope.in = function () {
                var width = Math.max(100, img.width() - 50), height = img.height() * (width / img.width());
                reset(width, height)
            }
            $scope.out = function () {
                var width = Math.min(1280, img.width() + 50), height = img.height() * (width / img.width());
                reset(width, height)
            }
            $compile($container)($scope).appendTo($app.el.container).find("img").on("load", function () {
                img = $app.$(this);
                img.css({
                    top: "calc((100vh - " + img.height() + "px)/2)",
                    left: "calc((100vw - " + img.width() + "px)/2)"
                })
            })
        }]);
    }

    $app.platform.dialog.zoom = function (option) {
        $app.loading(true);
        var img = $app.$("<img/>", {
            style: "display:none",
            src: option.url
        }).appendTo($app.el.container).on("load", function () {
            img.remove();
            $app.loading(false).then(function () {
                zoom(option);
            });
        })
    };
}