//=========================================================================
//============================= 2017-7-02 ============================
//=========================================================================
module.exports = function ($app) {
    $app.register.factory("ProjectService", ["RequestService", "$q", function (requestService, $q) {
        // 项目信息
        return {
            publish: function (input) {
                /*var self = this;
                return requestService.post("sdk/server/basic/project", {params: angular.extend({action: 1002}, {input: input})}).finally(function () {
                    self.refreshDictionary();
                });*/
                var deferred = $q.defer();
                deferred.resolve({data: {success: true, messag: "", data: {}}})
                return deferred.promise;
            },
            drop: function (id) {
                return requestService.post("sdk/server/basic/project", {params: {action: 1003, id: id}})
            },
            findPager: function (params) {
                // return requestService.get("sdk/server/basic/project", {params: angular.extend({action: 1001}, params)});
                var deferred = $q.defer();
                deferred.resolve({data: {success: true, messag: "", data: {pager: {}}}})
                return deferred.promise;
            },
            quick: function (params) {
                return requestService.get("sdk/server/basic/project", {params: angular.extend({action: 1004}, params)});
            },
            // 初始化
            refreshDictionary: function () {
                return this.quick().then(function ($response) {
                    $app.dictionary.PROJECTS = $app.buildOption($response.data.data);
                })
            }
        }
    }]);
}
