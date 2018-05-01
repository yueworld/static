//=========================================================================
//============================= 2017-7-02 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("ProjectService", ["RequestService", function (requestService) {
        // 项目信息
        return {
            publish: function (input) {
                var self = this;
                return requestService.post("sdk/basic/project", {params: angular.extend({action: 1002}, {input: input})}).finally(function () {
                    self.refreshDictionary();
                });
            },
            drop: function (id) {
                return requestService.post("sdk/basic/project", {params: {action: 1003, id: id}})
            },
            findPager: function (params) {
                return requestService.get("sdk/basic/project", {params: angular.extend({action: 1001}, params)});
            },
            quick: function (params) {
                return requestService.get("sdk/basic/project", {params: angular.extend({action: 1004}, params)});
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
