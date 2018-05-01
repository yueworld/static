module.exports = function ($app, $state) {
    // 品牌库
    $state.state("basic.info.brand", {
        url: "/brand", "abstract": true,
        /*cache:false,*/
        template: '<div class="col-xs-12 p0 bg-white animated-ui-view fadeIn fadeOut" ui-view></div>',
        controller: require("../controller/brand").default($app)
    });
    // 品牌库
    $state.state("basic.info.brand.index", {
        url: "/index.html?layoutId&projectId&likeName&approvalStatusId",
        template: require("../views/brand/brand.index.html"),
        controller: require("../controller/brand").index($app),
        resolve: {
            $response: ["$rootScope", "$q", /*"StoreTypeService",*/ "BrandService", function ($rootScope, $q, /*storeTypeService,*/ brandService) {
                /*return $q.all([
                    brandService.findPager($app.router.params)
                ]).then(function ($response) {basic.info.brand.index
                    return {
                        brands: $response[0].data.data
                    }
                })*/
                return {brands: {}}
            }]
        }
    });
    // 详情
    $state.state("basic.info.brand.publish", {
        cache: false,
        url: "/publish.html?id",
        template: require("../views/brand/brand.publish.html"),
        controller: require("../controller/brand").publish($app),
        resolve: {
            $response: ["$rootScope", "$q", "BrandService", function ($rootScope, $q, brandService) {
                /*return $q.all([
                    brandService.detail($app.router.params.id)
                ]).then(function ($response) {
                    return {
                        detail: $response[0].data.data
                    }
                })*/
                return {detail: {}}
            }]
        }
    })
}