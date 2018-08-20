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
    title: "示例、Simple",
    ready: function ($app) {
        $app.loading(false);
    }
}, [function ($app) {
    $app.register.service("url", [], [{
        "tenant": function () {
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
        }, "LeaseCont": function () {
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
    }]);
    $app.register.controller("MainController", ["$scope", "$q", "$timeout", function ($scope, $q, $timeout) {
        var self = this.init($scope, {
            listOptions: {
                columns: [
                    {name: "编号", field: "no"},
                    {name: "项目名称"},
                    {name: "地址"}
                ], pager: {
                    results: [{no: 1}, {no: 1}, {no: 1}]
                }
            }
        }), input = $scope.input = {layoutId: 100331,paymentUnitIds:"2"};
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
        $scope.diyChoose = function () {
            var tempalte = "<div><div class='col-xs-12 header'><h4>标题</h4><i ys-platform-icon=\"{name:'close-1',width:20,height:56}\" class='close' ng-click='close()'></i></div><div  class='col-xs-12 body'>自定义模态弹出框！</div><div class='col-xs-12 footer'><button class='btn ys-platform-btn-default' ng-click='close()'>取消</button><button class='btn ys-platform-btn-primary' ng-click='submit()'>确认</button></div></div>"
            $app.modal({
                template: tempalte
            })
        }
        // console.log($app.date.spacingText("2018-05-31", "2018-07-01"))
        // console.log($app.date.spacingText("2018-05-31", "2018-06-01"))

    }])
}])