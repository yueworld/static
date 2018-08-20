/**
 * uploader.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 16:42:13
 * @description 文件上传
 */
module.exports = function ($app) {
    $app.register.directive("ysPlatformUploader", ["$timeout", function ($timeout) {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs", "$timeout", "$http", function ($scope, $element, $attrs, $timeout, $http) {
                var $el = $app.$($element),
                    params = $scope.ysPlatformUploader = angular.extend({
                        // 上传
                        action: 1002,
                        // 是否单文件
                        single: "1",
                        // 分类
                        category: undefined,
                        // 单位 K
                        maxSize: 2 * 1024,
                    }, $scope.$eval($attrs.ysPlatformUploader));
                var file = $app.$('<input type="file" style="display: none;"/>').appendTo("body");
                $el.click(function () {
                    if (!params.category) {
                        $app.tip.error({message: "未配置 category 属性！"});
                    } else {
                        file.trigger("click");
                    }
                });
                file.change(function (event) {
                    $app.loading(true);
                    var data = new FormData();
                    data.append("action", params.action)
                    data.append("file", event.target.files[0])
                    data.append("single", params.single ? 1 : 2);
                    data.append("category", params.category);
                    data.append("maxSize", params.maxSize);
                    data.append("targetId", params.targetId || "")
                    $http({
                        method: 'POST',
                        url: $app.url.getDynamicUrl("sdk/platform/file"),
                        data: data, headers: {'Content-Type': undefined},
                        transformRequest: angular.identity
                    }).then(function ($response) {
                        file.val("")
                        var response = $response.data;
                        if (response.success) {
                            $app.tip.success({message: "上传完成！"});
                            $timeout(function () {
                                params.complete && params.complete(response.data)
                            })
                        } else {
                            $app.msgbox.error({message: response.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                })
                $scope.$on("$destroy", function () {
                    file.remove();
                })
            }]
        };
    }]);
}