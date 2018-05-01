module.exports = function ($app) {
    // Dialog
    $app.dialog.workflow = {
        process: {
            tree: function (filter) {
                return $app.injector.invoke(["$q", "WorkflowService", function ($q, workflowService) {
                    var deferred = $q.defer();
                    workflowService.quickCategory().then(function ($response) {
                        var categories = $app.buildOption($response.data.data, true, function (category) {
                            return category.isEnabled == 1;
                        })
                        $app.dialog.tree({
                            title: "表单", items: categories,
                            expandedItems: $app.cookie.get("ys-wf-process-right-menus-expanded-status", "").split(","),
                            filter: filter
                        }).then(function (result) {
                            deferred.resolve(result);
                        }, angular.noop, function (result) {
                            $app.cookie.set({
                                name: "ys-wf-process-right-menus-expanded-status",
                                value: result.values.map(function (item) {
                                    return item.id;
                                }).join(",")
                            });
                        })
                    });
                    return deferred.promise;
                }])
            }
        }
    }
}