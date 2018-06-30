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
    // container: "#app",
    loading: true,
    title: "xxxxxxx",
    ready: function ($app) {
        $app.loading(false);
    }
}, [function ($app) {
    $app.service.register("url", {
        name: "tenant", init: function (requestService) {
            return {
                quick: function (params) {
                    return $app.helper.promise(function () {
                        console.log(params);
                        return {
                            data: {
                                data: [
                                    {id: 1024, name: "麦当劳"},
                                    {id: 1025, name: "KFC"},
                                    {id: 1026, name: "阿迪达斯"}
                                ]
                            }
                        };
                    })
                }
            }
        }
    });
    $app.service.register("url", {
        name: "LeaseCont", init: function (requestService) {
            return {
                quick: function (params) {
                    return $app.helper.promise(function () {
                        console.log(params);
                        return {
                            data: {
                                data: [
                                    {id: 1024, no: "ZLHT-2018-12-1245/阿迪达斯"},
                                    {id: 1025, no: "ZLHT-2018-12-1246/麦当劳"},
                                    {id: 1026, no: "ZLHT-2018-12-1246/KFC"}
                                ]
                            }
                        };
                    })
                }
            }
        }
    });
    $app.controller("MainController", ["$scope", "$q", "$timeout", function ($scope, $q, $timeout) {
        var input = $scope.input = {};
        $scope.quickSearch = function (filter, option) {
            // console.log(filter)
            // console.log(option)
            return $app.helper.promise(function () {
                return [
                    {id: "1001", text: "上海七宝宝龙城市广场"},
                    {id: "1002", text: "上海七宝万科城市广场"}
                ]
            })
        };

        // $app.dictionary.AREAS=$app.dictionary.build([{id:1,name:"广深"},{id:2,name:"上海"},{id:3,name:"西南"}])
        $scope.chooseContract = function () {
            $app.contract.dialog.choose().then(function ($response) {
                console.log($response);
            })
        }
        $scope.tip=function () {
            $app.tip.error({message:"大法师大法师地方"});
        }
        $timeout(function () {
            /*$app.contract.dialog.choose().then(function ($response) {
                console.log($response);
            })*/
        }, 1000)
        console.log($app.date.spacingText("2018-05-31", "2018-07-01"))
        console.log($app.date.spacingText("2018-05-31", "2018-06-01"))
    }])
}])