//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    $app.register.factory("BrandService", ["RequestService", function (requestService) {
        return {
            publish: function (input) {
                return requestService.post("sdk/basic/brand", {params: angular.extend({action: 1002}, {input: input})});
            },
            drop: function (id) {
                return requestService.post("sdk/basic/brand", {params: {action: 1003, id: id}})
            },
            findPager: function (params) {
                return requestService.get("sdk/basic/brand", {params: angular.extend({action: 1001}, params)});
            },
            quick: function (params) {
                return requestService.get("sdk/basic/brand", {params: angular.extend({action: 1004}, params)});
            },
            detail: function (id) {
                return requestService.get("sdk/basic/brand", {params: angular.extend({action: 1005}, {id: id})});
            },
            approval: function (input) {
                return requestService.get("sdk/basic/brand", {params: angular.extend({action: 1006}, input)});
            }
        }
    }]);
}
