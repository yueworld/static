module.exports = function ($app) {

    // ========================================== FormHelper =================================================================

    /**
     * 表单事件绑定
     * @param $scope
     * @param method
     * @param _option
     */
    function bind($scope, method /*方法名*/, _option /*{loading:"等待提示",slide:"滑动特效",invoke:"待执行逻辑"}*/) {
        var $q = $app.injector.get("$q"), $timeout = $app.injector.get("$timeout"),
            option = angular.extend({
                loading: true, slide: true, assert: angular.noop, invoke: function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: {success: false, error: "未定义 invoke 逻辑！"}});
                    return deferred.promise;
                }, success: function () {
                    if ($scope.refresh /*&& $scope.input && !$scope.input.id*/) {
                        $scope.refresh().then(function () {
                            $app.tip.success({message: "操作完成"});
                        })
                    } else {
                        $app.tip.success({message: "操作完成"});
                    }
                }, error: function (data) {
                    $app.tip.error({message: data.message});
                }
            }, _option)
        $scope[method] = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            option.loading && $app.loading(true);
            try {
                // 清理历史异常信息
                if ($scope.input) {
                    $scope.input.errorCode = undefined;
                }
                // 验证
                option.assert();
                option.invoke.apply(this, args).then(function ($response) {
                    var response = $response.data;
                    if (response.success) {
                        if (option.slide && $scope.pager) {
                            if ($scope.input && $scope.input.id) {
                                $app.form.row.slideToggle({
                                    event: args[0], pager: $scope.pager, item: $scope.input
                                }).then(function () {
                                    option.success({args: args, message: "操作完成"});
                                });
                            } else {
                                $app.form.row.slideToggle({event: args[0], pager: $scope.pager}).then(function () {
                                    option.success({args: args, message: "操作完成"});
                                });
                            }
                        } else {
                            option.success({args: args, message: response.message});
                        }
                    } else {
                        if ($scope.input) {
                            $timeout(function () {
                                $scope.input.errorCode = response.code;
                            })
                        }
                        option.error({args: args, message: response.message});
                    }
                }).finally(function () {
                    $app.loading(false);
                })
            } catch (ex) {
                if ($scope.input) {
                    $timeout(function () {
                        $scope.input.errorCode = ex.code;
                    })
                }
                $app.loading(false);
                option.error({args: args, message: ex});
            }
        }
    }

    /**
     *
     * @param option
     */
    function publishToggle(option) {
        var //container = $app.$(option.event.currentTarget).parents(".ys-framework-product"),
            container = option.container ? option.container : $app.$(option.event.currentTarget).parents("table:first"),
            //panel = container.find("div.ys-framework-grid-form"),
            panel = container.find(">tbody>tr>td>.ys-framework-grid-form"),
            $timeout = $app.injector.get("$timeout"), deferred = $app.injector.get("$q").defer();
        // console.log(container.length+"===================")
        if (panel.length > 0) {
            // 全部收起
            panel.slideUp("fast", function () {
                // $app.$(this).parents("tbody").removeClass("selected");
                $app.$(this).parents("table:first>tbody").removeClass("selected");
                $timeout(function () {
                    if (option.item) {
                        // console.log("1--------------------")
                        if (option.pager.editorSelectedItem == option.item) {
                            option.pager.editorSelectedItem = undefined;
                            deferred.resolve();
                            //  console.log("1.1--------------------")
                        } else {
                            option.pager.add = option.pager.editorSelectedItem = undefined;
                            $app.form.row.slideToggle(option).then(function () {
                                deferred.resolve();
                            });
                            // console.log("1.2--------------------")
                        }
                    } else {
                        // console.log("2--------------------")
                        if (option.pager.add) {
                            //  console.log("2.1--------------------")
                            option.pager.add = undefined;
                            deferred.resolve();
                        } else {
                            // console.log("2.2--------------------")
                            option.pager.add = option.pager.editorSelectedItem = undefined;
                            $app.form.row.slideToggle(option).then(function () {
                                deferred.resolve();
                            });
                        }

                    }
                })
            })
        } else if (option.item) {
            // 展开
            // console.log("3-----------------")
            option.pager.editorSelectedItem = option.item;
            $timeout(function () {
                // container.find("div.ys-framework-grid-form").slideDown("fast").parents("tbody").addClass("selected");
                container.find(">tbody>tr>td>.ys-framework-grid-form").slideDown("fast").parents("tbody").addClass("selected");
            })
        } else {
            // console.log("4-----------------")
            option.pager.add = true;
            $timeout(function () {
                // container.find("div.ys-framework-grid-form").slideDown("fast")
                container.find(">tbody>tr>td>.ys-framework-grid-form").slideDown("fast")
            })
        }
        return deferred.promise;
    };

    /**
     *  删除
     * @param option {service:"xxxxService",refresh:refresh,id:xxxx,message}
     */
    function publishDrop(option) {
        option = angular.extend({message: "您正在删除信息<br/>该操作不可恢复、确定执行？"}, option);
        var service = $app.injector.get($app.helper.firstUpperCase(option.service) + "Service");
        $app.assert(!service, service + "Service" + "，服务未定义！");
        $app.dialog.confirm({message: option.message}).then(function (result) {
            if (result.execute) {
                $app.loading(true);
                service.drop(option.id).then(function ($response) {
                    var response = $response.data;
                    if (response.success) {
                        if (option.refresh) {
                            option.refresh().then(function () {
                                $app.tip.success({message: "操作完成"});
                            });
                        }
                    } else {
                        $app.msgbox.error({message: response.message});
                        $app.loading(false);
                    }
                })
            }
        })
    }

    $app.form = {
        // 表单事件绑定
        bind: bind,
        // 表单
        publish: {
            // 显示隐藏
            toggle: publishToggle,
            // 删除
            drop: publishDrop
        }
    }
}