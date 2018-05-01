module.exports = {
    index: function ($app) {
        return ["$scope", "$state", "$timeout", "$response", "$element", function ($scope, $state, $timeout, $response, $element) {
            var pager = $scope.pager = $response.projects,
                filter = $scope.filter = $app.extend({termTemp: $app.router.params.term}, $app.router.params, true);
            // 添加菜单
            $app.setTopSubBarMenus([{
                text: "新增项目", icon: "add-1", click: function ($event) {
                    $app.form.row.slideToggle({
                        event: $event, pager: pager,
                        container: $element.find("table.ys-framework-grid.main")
                    });
                }
            }])
            // 刷新页面
            $scope.refresh = function () {
                filter.term = filter.termTemp;
                return $state.go("basic.info.project.index", filter, {reload: true});
            }
            $scope.$watch("filter.areaId+filter.operateStatusId+filter.page", function (n, o) {
                if (n != o) {
                    $scope.refresh();
                }
            })
        }]
    }
}
