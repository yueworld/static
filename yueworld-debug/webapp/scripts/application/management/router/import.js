module.exports = function ($app, $state) {
    // Angular Run 事件 优先级 2
    $app.register.run(["$templateCache", function ($templateCache) {
        $templateCache.put("management/views/workflow/workflow.design.header.html", require("../views/workflow/workflow.design.header.html"));
    }]);
    $app.register.config(["$provide", "$stateProvider", "$locationProvider", function ($provide, $state, $locationProvider) {
        // 管理
        $state.state("management", {
            url: "/management", "abstract": true, template: '<div ui-view></div>',
            controller: function () {
                $app.setTopBarMenus([
                    // {text: "行政人事", state: "management.ehr.recruitment.index", includes: "management.ehr"},
                    {text: "业务审批", state: "management.workflow.process.index", includes: "management.workflow"}
                ]);
            }
        });
        // 业务审批
        [
            // 审批
            require("./workflow")
        ].forEach(function (callback) {
            callback($app, $state)
        });
    }])
}