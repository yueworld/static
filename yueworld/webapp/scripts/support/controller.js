/**
 * BaseController
 * @param $app
 */
module.exports = function ($app) {
    /**
     * 初始化
     */
    var BaseController = {
        init: function (_$scope, definition) {
            if (_$scope === undefined) {
                throw new Error("Controller未初始化，请先执行 this.init($scope) 进行初始化");
            }
            var $scope = this.$scope = _$scope, self = $scope.self = this,
                $timeout = $app.injector.get("$timeout"), $q = $app.injector.get("$q"),
                filter = undefined, reload = undefined, clear = undefined;

            // Filter 过滤
            filter = self.filter = $scope.filter = $app.helper.extend(definition.filter || {}, $app.router.params, true);

            // Reload 重载
            self.reload = $scope.reload = definition.reload ? definition.reload : function () {
                return $app.router.go($app.router.name, self.filter, {reload: true});
            };

            // Clear 清空
            self.clear = $scope.clear = definition.clear ? definition.clear : function () {
                angular.forEach($app.router.params, function (value, field) {
                    $app.router.params[field] = undefined;
                })
                $app.router.go($app.router.name, $app.router.params, {reload: true});
            }

            // Input 数据模型
            if (definition.input) {
                self.input = $scope.input = angular.extend({isEdit: true}, angular.isObject(definition.input) ? definition.input : $scope.$eval(definition.input))
            }

            // listOptions ys-platform-list 初始化
            if (definition.listOptions) {
                // 列表选项
                self.listOptions = $scope.listOptions = angular.extend({
                    // 过滤
                    filter: filter,
                    // 列
                    columns: [],
                    // 分页内容
                    pager: {},
                    // 详情页 指令
                    detail: "",
                    // 重载条件
                    watchReload: "",
                    // 新增默认记录
                    newItem: {}
                }, definition.listOptions);

                // Watch 条件
                if (self.listOptions.watchReload) {
                    $scope.$watch(self.listOptions.watchReload, function (n, o) {
                        if (n != o) {
                            self.reload();
                        }
                    })
                }
            }

            // Submit 提交
            if (definition.submit) {
                var submitOptions = angular.extend({
                    loading: true,
                    slide: true,
                    assert: angular.noop,
                    invoke: function () {
                        var deferred = $q.defer();
                        deferred.resolve({data: {success: false, message: "未定义 invoke 逻辑！"}});
                        return deferred.promise;
                    }, success: function () {
                        if (self.reload) {
                            self.reload().then(function () {
                                $app.tip.success({message: "操作完成"});
                            })
                        } else {
                            $app.tip.success({message: "操作完成"});
                        }
                    }, error: function (data) {
                        $app.tip.error({message: data.message});
                    }
                }, definition.submit);
                $scope.submit = self.submit = function () {
                    var args = Array.prototype.slice.call(arguments, 0), input = self.input;
                    try {
                        if (submitOptions.loading) {
                            $app.loading(true);
                        }
                        // 清理历史异常信息
                        input.errorCode = undefined;
                        // 验证
                        submitOptions.assert.apply(this, args);
                        submitOptions.invoke.apply(this, args).then(function ($response) {
                            if (!$response) {
                                submitOptions.error({message: "执行 invoke 未获取到返回结果！"});
                            } else {
                                var response = $response.data;
                                if (response.success) {
                                    if ($scope.slideUp) {
                                        $scope.slideUp(input).then(function () {
                                            submitOptions.success({args: args, message: "操作完成"});
                                        })
                                    } else {
                                        submitOptions.success({args: args, message: "操作完成"});
                                    }
                                } else {
                                    if (input) {
                                        $timeout(function () {
                                            input.errorCode = response.code;
                                        })
                                    }
                                    submitOptions.error({args: args, message: response.message});
                                }
                            }
                        }).finally(function () {
                            $app.loading(false);
                        })
                    } catch (ex) {
                        console.log(ex)
                        $timeout(function () {
                            input.errorCode = ex.code;
                        })
                        $app.loading(false);
                        submitOptions.error({args: args, message: ex.message});
                    }
                }
            }

            // 文件管理
            self.fileManager = function (input, option) {
                $app.platform.dialog.fileManager(angular.extend({files: input.attachments, category: "BRAND_ATTACHMENTS", load: input.id ? true : false, targetId: input.id}, option)).then(function ($response) {
                    input.attachments = input.attachments ? input.attachments : [];
                    angular.forEach($response.values, function (value) {
                        input.attachments.push(value);
                    })
                });
            }
            // 删除文件
            self.dropFile = function (files, file) {
                return $app.injector.get("FileService").dropDispose(files, file);
            }
            // 事件绑定
            self.$on = function () {
                var args = $app.helper.getArg(arguments, 0);
                $app.injector.invoke(["$rootScope", function ($rootScope) {
                    var destroyCallback = $rootScope.$on.apply($rootScope, args);
                    $scope.$on("$destroy", function () {
                        angular.isFunction(destroyCallback) && destroyCallback()
                    })
                }]);
            }

            // 发布事件
            self.$publish = function () {
                $app.injector.invoke(["$rootScope", function ($rootScope) {
                    $rootScope.$emit.apply(this.$rootScope, $app.helper.getArg(arguments, 0))
                }]);
            }

            // 新增
            self.$on("add", function () {
                self.filter.add = !self.filter.add;
            });

            return this;
        }
    };
    return {
        // 暴露 BaseController
        base: BaseController,
        // 继承 Controller
        extend: function extend(controller) {
            if (angular.isArray(controller)) {
                angular.extend(controller[controller.length - 1].prototype, BaseController);
            } else {
                angular.extend(controller.prototype, BaseController);
            }
            return controller;
        }
    }
}