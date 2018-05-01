module.exports = function ($app, $state) {
    // 抬头
    $state.state("basic.info.head", {
        url: "/head", "abstract": true, template:'<div class="col-xs-12 p0"><div class="col-xs-12 p0 bg-white animated-ui-view fadeIn fadeOut" ui-view></div></div>'
    });
    $state.state("basic.info.head.index", {
        url: "/index.html?statusId&term&page", template: require("../views/head/head.index.html"),
        controller: require("../controller/head").index($app),
        resolve: {
            "$response": ["$rootScope", "HeadService", function ($scope, headService) {
                return {data:{data:{}}}
            }]
        }
    })
}