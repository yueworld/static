module.exports = function ($app) {

    // 遮罩、背景
    $app.backdrop = function () {
        var backdrop = $app.$('<div class="ys-framework-backdrop"></div>').appendTo($app.el.body),
            $animate = $app.injector.get("$animate"),
            $rootScope = $app.injector.get("$rootScope"),
            promise = $animate.addClass(backdrop, "in");
        $rootScope.$apply();

        function hide() {
            var _promise = $animate.removeClass(backdrop, "in").then(function () {
                backdrop.remove();
            })

            $rootScope.$apply();
            return _promise;
        }

        return {hide: hide, promise: promise}
    }

}