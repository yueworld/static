module.exports = function ($app) {
    // Loading
    $app.loading = function (show) {
        if (show) {
            $app.injector.invoke(["$animate", "$timeout", function ($animate, $timeout) {
                $timeout(function () {
                    $animate.addClass($app.el.loading.show(), "in")
                })
            }])
            // $app.el.loading.show().addClass("in");
        } else {
            $app.injector.invoke(["$animate", "$timeout", function ($animate, $timeout) {
                $timeout(function () {
                    $animate.removeClass($app.el.loading, "in").then(function () {
                        $app.el.loading.hide();
                    });
                })
            }])
        }
    }
    if ($app.el.loading.length == 0) {
        $app.el.loading = $app.$(require("../application/platform/views/loading.html")).appendTo($app.el.body);
    }
}