//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("PositionService", ["RequestService", function (requestService) {
        return {
            quick: function (params) {
                return requestService.get("sdk/platform/position", {params: angular.extend({action: 1004}, params)});
            }
        }
    }]);
}