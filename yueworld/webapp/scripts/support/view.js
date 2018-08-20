/**
 * Register
 * @param $app
 * @param app = angularModule
 */
module.exports = function ($app) {
    $app.views = {
        product: require("../application/platform/views/app.product.html"),
        container: require("../application/platform/views/app.container.html")
    }
}