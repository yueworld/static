require("../application/platform/views/loading.scss")
module.exports = function ($app) {
    // Loading
    $app.loading = function (show) {
        return $app.injector.invoke(["$timeout", "$animate", function ($timeout, $animate) {
            return $timeout(function () {
                if (show) {
                    if ($app.el.loading.is(":visible")) {
                        return $app.helper.promise(function () {
                            return true;
                        });
                    }
                    return $animate.addClass($app.el.loading.addClass("complete").show(), "in")
                } else {
                    return $animate.removeClass($app.el.loading, "in").then(function () {
                        $app.el.loading.hide();
                    });
                }
            })
        }])
    }
}