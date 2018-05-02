module.exports = function ($app) {
    // Loading
    $app.loading = function (show) {
        if (show) {
            $app.el.loading.show().addClass("in");
        } else {
            $app.injector.get("$animate").removeClass($app.el.loading, "in").then(function () {
                $app.el.loading.hide();
            });
            $app.injector.get("$timeout")(function () {
                $app.injector.get("$rootScope").$apply();
            })
        }
    }
    if ($app.el.loading.length == 0) {
        $app.el.loading = $app.$(require("../application/platform/views/loading.html")).appendTo($app.el.body);
    }
    if (!$app.setup.loading) {
        $app.el.loading.hide();
    }

}