module.exports = function ($app) {
    $app.directive("uploader", ["$timeout", function ($timeout) {
        return {
            restrict: "A", replace: true,
            scope: {
                uploader: "="
            }, controller: ["$scope", "$element", "$attrs", "$http", function ($scope, $element, $attrs, $http) {
                var file = $app.$('<input type="file" style="display: none;"/>').appendTo("body");
                $app.$($element).click(function () {
                    if (!$scope.uploader.category) {
                        $app.tip.error({message: "未配置category属性！"});
                    } else {
                        file.trigger("click");
                    }
                });
                file.change(function (event) {
                    $app.loading(true);
                    var data = new FormData();
                    data.append("action", 1002)
                    data.append("file", event.target.files[0])
                    data.append("single", $scope.uploader.single || $scope.uploader.single == undefined ? "1" : "2");
                    data.append("category", $scope.uploader.category);
                    data.append("maxSize", $scope.uploader.maxSize || 2 * 1024); // 单位 K
                    data.append("targetId", $scope.uploader.targetId || "")
                    $http({
                        method: 'POST',
                        url: $app.getDynamicUrl("sdk/platform/attachment"),
                        data: data,
                        headers: {'Content-Type': undefined},
                        transformRequest: angular.identity
                    }).then(function ($response) {
                        file.val("")
                        $app.loading(false);
                        var response = $response.data;
                        if (response.success) {
                            $app.tip.success({message: "上传完成！"});
                            $timeout(function () {
                                $scope.uploader.complete && $scope.uploader.complete(response.data)
                            })
                        } else {
                            $app.dialog.error({message: response.message});
                        }
                    })
                })
                $scope.$on("$destroy", function () {
                    file.remove();
                })
            }]
        };
    }]);
}