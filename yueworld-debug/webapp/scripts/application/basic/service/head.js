//=========================================================================
//============================= 2017-7-02 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("HeadService", ["RequestService", function (requestService) {
        // 甲方合同抬头
        return {
            publish: function (input) {
                return requestService.post("sdk/basic/head", {params: angular.extend({action: 1002}, {input: input})});
            },
            drop: function (id) {
                return requestService.post("sdk/basic/head", {params: {action: 1003, id: id}})
            },
            findPager: function (params) {
                return requestService.get("sdk/basic/head", {params: angular.extend({action: 1001}, params)});
            },
            quick: function (params) {
                return requestService.get("sdk/basic/head", {params: angular.extend({action: 1004}, params)});
            }
        }
    }]);
}
