module.exports = {
    index: function ($app) {
        return ["$scope", "$state", "$timeout", "$response", function ($scope, $state, $timeout, $response) {
            var pager = $scope.pager = $response.data.data,
                filter = $scope.filter = $app.helper.extend({termTemp: $app.router.params.term}, $app.router.params, true);
            // 添加菜单
            $app.setTopSubBarMenus([{
                text: "新增公司", icon: "add-1", click: function ($event) {
                    $app.form.publish.toggle({event: $event, pager: pager});
                }
            }])
            // 刷新数据
            $scope.refresh = function () {
                filter.term = filter.termTemp;
                return $state.go("basic.info.head.index", filter, {reload: true});
            }
            $scope.$watch("filter.statusId+filter.page", function (n, o) {
                if (n != o) {
                    $scope.refresh();
                }
            })
            /*$app.modal({
                title: "asdf", resolve: {
                    projectService: ["$timeout", function ($timeout) {
                        return $timeout(function () {
                            return 100;
                        },1500)
                    }]
                }
            })*/
        }];
    }
}