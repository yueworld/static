//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    $app.register.factory("UserService", ["RequestService", function (requestService) {
        return {
            quick: function (params) {
                return requestService.get("sdk/platform/user", {params: angular.extend({action: 1004}, params)});
            }, check: function (params) {
                return requestService.get("sdk/platform/user", {params: angular.extend({action: 2001}, params)});
            }, logout: function () {
                return requestService.get("sdk/platform/user", {params: angular.extend({action: 2002}, {_slk_: true})});
            }
        }
    }]);
};