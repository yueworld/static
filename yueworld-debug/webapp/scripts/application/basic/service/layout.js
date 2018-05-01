//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("LayoutService", ["$q", "RequestService", function ($q, requestService) {
        return {
            publish: function (input) {
                var self = this, deferred = $q.defer()
                requestService.post("sdk/basic/layout", {params: angular.extend({action: 1002}, {input: input})}).then(function ($response) {
                    self.refreshDictionary().then(function () {
                        deferred.resolve($response);
                    });
                });
                return deferred.promise;
            },
            drop: function (id) {
                var self = this, deferred = $q.defer()
                requestService.post("sdk/basic/layout", {params: {action: 1003, id: id}}).then(function ($response) {
                    self.refreshDictionary().then(function () {
                        deferred.resolve($response);
                    });
                });
                return deferred.promise;
            },
            quick: function (params) {
                return requestService.get("sdk/basic/layout", {params: angular.extend({action: 1004}, params)});
            },
            // 初始化
            refreshDictionary: function () {
                return this.quick().then(function ($response) {
                    $app.dictionary.LAYOUTS = $app.buildOption($response.data.data, true);
                })
            }
        }
    }]);
}
