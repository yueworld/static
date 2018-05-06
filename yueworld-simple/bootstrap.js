/**
 * bootstrap.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-03-02 10:32:11
 * @description Bootstrap App
 */
// 初始化
require("../yueworld/export");
$app.bootstrap({
    // loading: true,
    ready: function ($app) {
        //  $app.loading(false);
    }
}, [function ($app) {
    $app.controller("MainController", ["$scope", "$q", function ($scope, $q) {
        var input = $scope.input = {};

        $app.helper.promise(function () {
            return []
        })
        $scope.quickSearch = function (filter, option) {
            console.log(filter)
            console.log(option)
            return $app.helper.promise(function () {
                return [
                    {id: "1001", text: "上海七宝宝龙城市广场"},
                    {id: "1002", text: "上海七宝万科城市广场"}
                ]
            })
        }
    }])
}])