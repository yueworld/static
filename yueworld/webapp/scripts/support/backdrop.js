module.exports = function ($app) {

    /**
     * 遮罩、背景
     * @param option
     * @returns {{show: show, hide: hide}}
     */
    function backdrop(option) {

        option = angular.extend({show: true}, option);
        var backdrop = $app.$('<div class="ys-platform-backdrop"></div>').appendTo($app.el.container);

        function show() {
            return $app.injector.invoke(["$animate", "$timeout", function ($animate, $timeout) {
                return $timeout(function () {
                    return $animate.addClass(backdrop, "in");
                });
            }]);
        }
        function hide() {
            return $app.injector.invoke(["$animate", "$timeout", function ($animate, $timeout) {
                return $timeout(function () {
                    return $animate.removeClass(backdrop, "in").then(function () {
                        backdrop.remove();
                    })
                });
            }])
        }

        if (option.show) {
            show();
        }
        return {show: show, hide: hide}
    }

    $app.backdrop = backdrop;
}