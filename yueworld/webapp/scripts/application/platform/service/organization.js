//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================

module.exports = function ($app) {
    $app.factory("OrganizationService", ["RequestService", function (requestService) {
        return {
            quick: function (params) {
                return requestService.get("sdk/platform/organization", {params: angular.extend({action: 1004}, params)});
            }
        }
    }]);
}