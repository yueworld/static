// =========================================================
window.$app = {
    // loading: false
    bootstrap: function () {
        var template = '';
        template += '<div>';
        template += '   <div class="col-xs-12 p0 selector-header"><div class="col-xs-12 pl20 title">自定义对话框</div></div>';
        template += '   <div class="col-xs-12 p20 select-body text-center">';
        template += '       <span class="fwb" style="font-size: 24px;">吧啦吧啦</span>';
        template += '   </div>';
        template += '   <div class="col-xs-12 p0 selector-footer">';
        template += '       <button class="btn btn-primary pull-right" ng-click="submit(true)">确认</button>';
        template += '       <button class="btn btn-default pull-right" ng-click="submit(false)">取消</button>';
        template += '   </div>';
        template += '</div>';
        $app.modal({
            width: 300, template: template, controller: ["$scope", function ($scope) {
                $scope.submit = function (execute) {
                    $scope.close(function () {
                        if (execute) {
                            $app.tip.success({message: "您执行了确认操作！"});
                        } else {
                            $app.tip.warning({message: "您执行了取消操作！"});
                        }
                    })
                }
            }]
        });
    }
}
require("../yueworld/export");


