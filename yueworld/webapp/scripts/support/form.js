module.exports = function ($app) {

    // ========================================== FormHelper =================================================================

    /**
     * 表单事件绑定
     * @param $scope
     * @param method
     * @param _option
     */
    function bind($scope, method /*方法名*/, _option /*{loading:"等待提示",slide:"滑动特效",invoke:"待执行逻辑"}*/) {
        $app.injector.invoke(["$q", "$timeout", function ($q, $timeout) {
            var option = angular.extend({
                loading: true,
                slide: true,
                assert: angular.noop,
                invoke: function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: {success: false, message: "未定义 invoke 逻辑！"}});
                    return deferred.promise;
                }, success: function () {
                    if ($scope.reload) {
                        $scope.reload().then(function () {
                            $app.tip.success({message: "操作完成"});
                        })
                    } else {
                        $app.tip.success({message: "操作完成"});
                    }
                }, error: function (data) {
                    $app.tip.error({message: data.message});
                }
            }, _option);
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
                    try {
                        option.invoke.apply(this, args).then(function ($response) {
                            if (!$response) {
                                option.error({message: "form.js 执行 invoke 未获取到返回结果！"});
                            } else {
                                var response = $response.data;
                                if (response.success) {
                                    if ($scope.slideUp) {
                                        $scope.slideUp($scope.input).then(function () {
                                            option.success({args: args, message: "操作完成"});
                                        })
                                    } else {
                                        option.success({args: args, message: "操作完成"});
                                    }
                                } else {
                                    if ($scope.input) {
                                        $timeout(function () {
                                            $scope.input.errorCode = response.code;
                                        })
                                    }
                                    option.error({args: args, message: response.message});
                                }
                            }
                        }).finally(function () {
                            $app.loading(false);
                        })
                    } catch (ex) {
                        console.log(ex)
                    }
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
        }]);
    }

    $app.form = {
        // 表单事件绑定
        bind: bind
    }
}