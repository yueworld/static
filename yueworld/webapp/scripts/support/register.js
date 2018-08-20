/**
 * Register
 * @param $app
 * @param app = angularModule
 */
module.exports = function ($app, app) {

    /**
     * 基础 controller
     * @constructor
     */
    var BaseController = {
        // 初始化
        init: function ($scope, definition) {
            var self = this;
            definition = angular.extend({
                input: {isEdit: true},
                reload: function () {
                    return $app.router.go($app.router.name, self.filter, {reload: true});
                },
                clear: function () {
                    angular.forEach($app.router.params, function (value, field) {
                        $app.router.params[field] = undefined;
                    })
                    $app.router.go($app.router.name, $app.router.params, {reload: true});
                },
                toolbars: []
            }, definition);
            self.$scope = $scope;
            // 过滤条件
            self.filter = $scope.filter = $app.helper.extend(definition.filter || {}, $app.router.params, true);
            // 列表选项
            self.listOptions = $scope.listOptions = angular.extend({
                // 列
                columns: [],
                // 分页内容
                pager: {},
                // 详情页 指令
                detail: "",
                // 重载条件
                watchReload: ""
            }, definition.list, definition.listOptions, {filter: self.filter});
            // 清空
            self.clear = $scope.clear = definition.clear;
            // 重载、刷新
            self.reload = $scope.reload = definition.reload;
            // 绑定 controller
            $scope.self = self;
            // Watch 条件
            if (self.listOptions.watchReload) {
                $scope.$watch(self.listOptions.watchReload, function (n, o) {
                    if (n != o) {
                        self.reload();
                    }
                })
            }
            // 添加菜单
            if (!$scope.input && definition.toolbars) {
                $app.defaults.topbarRightSub = definition.toolbars;
                angular.forEach(definition.toolbars, function (bar) {
                    if (!bar.click) {
                        if (bar.command == "add") {
                            bar.click = function () {
                                self.filter.add = !self.filter.add;
                            }
                        }
                    }
                });
            }
            // 数据模型
            self.input = $scope.input = angular.extend({isEdit: true}, angular.isObject(definition.input) ? definition.input : $scope.$eval(definition.input))
            // 注册提交事件
            if (definition.submit) {
                self.submit(definition.submit);
            }
            return this;
        },
        fileManager: function (input, option) {
            var self = this;
            $app.platform.dialog.fileManager(angular.extend({files: input.attachments, category: "BRAND_ATTACHMENTS", load: input.id ? true : false, targetId: input.id}, option)).then(function ($response) {
                input.attachments = input.attachments ? input.attachments : [];
                angular.forEach($response.values, function (value) {
                    input.attachments.push(value);
                })
            });
        },
        // 提交
        submit: function (option /*{loading:"等待提示",slide:"滑动特效",invoke:"待执行逻辑"}*/) {
            var self = this, $scope = self.$scope, $q = $app.injector.get("$q"),
                $timeout = $app.injector.get("$timeout"),
                option = angular.extend({
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
                }, option);
            $scope.submit = function () {
                var args = Array.prototype.slice.call(arguments, 0);
                option.loading && $app.loading(true);
                try {
                    // 清理历史异常信息
                    self.input.errorCode = undefined;
                    // 验证
                    option.assert();
                    option.invoke.apply(this, args).then(function ($response) {
                        if (!$response) {
                            option.error({message: "执行 invoke 未获取到返回结果！"});
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
                    $timeout(function () {
                        $scope.input.errorCode = ex.code;
                    })
                    $app.loading(false);
                    option.error({args: args, message: ex});
                }
            }
        },
        // 事件绑定
        $on: function () {
            if (this.$scope === undefined) {
                throw new Error("Controller未初始化，请先执行 this.init($scope) 进行初始化");
            }
            var args = getArg(arguments, 0), destroyCallback = $rootScope.$on.apply($rootScope, args);
            this.$scope.$on("$destroy", function () {
                angular.isFunction(destroyCallback) && destroyCallback()
            })
        },
        // 发布事件
        $publish: function () {
            $rootScope.$emit.apply(this.$rootScope, getArg(arguments, 0))
        }
    }

    /**
     * 继承 Controller
     * @param controller
     */
    function $controller(controller) {
        if (angular.isArray(controller)) {
            angular.extend(controller[controller.length - 1].prototype, BaseController);
        } else {
            angular.extend(controller.prototype, BaseController);
        }
        return controller;
    }

    /**
     * 包装扩展 Controller
     */
    function wrapController() {
        var args = Array.prototype.slice.call(arguments, 0);
        $controller(args[1])
        return app.controller.apply(app, args)
    }

    /**
     * 包装扩展 Service
     */
    /**
     * 服务注册
     * @param url           服务 URL 前缀
     * @param dictionary    数据字典类型服务
     * @param conventional  常规服务
     */
    function wrapService(urlPrefix, dictionary, conventional) {
        var services = [];
        // 数据字典类型的服务
        angular.forEach(dictionary, function (value) {
            var service = {dictionary: true, factory: angular.noop}
            if (angular.isString(value)) {
                service.name = value;
                service.serviceName = $app.helper.firstUpperCase($app.helper.strToHumpNamespace(value)) + "Service";
            } else if (angular.isObject(value)) {
                $app.assert.isEmpty(value.name, "service.name 未定义！");
                service = angular.extend(service, {
                    name: value.name,
                    serviceName: $app.helper.firstUpperCase($app.helper.strToHumpNamespace(value.name)) + "Service"
                }, value)
            }
            services.push(service);
        })
        // 常规类型的服务
        angular.forEach(conventional, function (value) {
            var service = {dictionary: false, factory: angular.noop}
            if (angular.isString(value)) {
                service.name = value;
                service.serviceName = $app.helper.firstUpperCase($app.helper.strToHumpNamespace(value)) + "Service";
            } else if (angular.isObject(value)) {
                angular.forEach(value, function (factory, name) {
                    service.name = name;
                    service.serviceName = $app.helper.firstUpperCase($app.helper.strToHumpNamespace(name)) + "Service";
                    service.factory = factory;
                });
            }
            services.push(service);
        })
        angular.forEach(services, function (service) {
            var url = urlPrefix + service.name;
            app.factory(service.serviceName, ["RequestService", function (requestService) {
                var object = {
                    // 新增、修改
                    publish: function (input) {
                        var self = this;
                        return requestService.post(url, {params: angular.extend({action: 1002}, {input: angular.toJson(input)})}).finally(function () {
                            if (service.dictionary) {
                                self.refreshDictionary();
                            }
                        });
                    },
                    // 删除
                    drop: function (id) {
                        var self = this;
                        return requestService.post(url, {params: {action: 1003, id: id}}).finally(function () {
                            if (service.dictionary) {
                                self.refreshDictionary();
                            }
                        });
                    },
                    // 分页
                    findPager: function (params) {
                        return requestService.get(url, {params: angular.extend({action: 1001}, params)});
                    },
                    // 快速查询
                    quick: function (params) {
                        return requestService.get(url, {params: angular.extend({action: 1004}, params)});
                    },
                    // 详情
                    detail: function (id) {
                        return requestService.get(url, {params: angular.extend({action: 1005}, {id: id})});
                    },
                    // 刷新数据字典
                    refreshDictionary: function () {
                        return this.quick().then(function ($response) {
                            $app.dictionary[service.name.toUpperCase() + "S"] = $app.dictionary.build($response.data.data, true);
                        })
                    }
                }
                return angular.extend(object, object, service.factory(url, requestService));
            }]);
        })
    }

    // 通用配置
    // $app.register.sidebar.add()
    app.config(["$stateProvider", function ($stateProvider) {
        // 定制路由注册
        $app.register.router = function (statusName, url, template, controller, resolve) {
            if (url.indexOf("abstract:") != -1) {
                // 抽象路由
                $stateProvider.state(statusName, {
                    url: url.replace("abstract:", ""), "abstract": true,
                    template: template ? template : '<div class="col-xs-12 ys-platform-p0 ys-platform-bg-white animated-ui-view fadeIn fadeOut" ui-view></div>',
                    controller: controller, resolve: resolve
                });
            } else {
                var definition = {
                    url: url, controller: controller, resolve: resolve
                };
                if ($app.valid.startsWith(template, "url:")) {
                    definition.templateUrl = template.substr(4);
                } else if ($app.valid.startsWith(template, "find:")) {
                    definition.template = $app.$(template.substr(5)).html();
                } else {
                    definition.template = template ? template : '';
                }
                $stateProvider.state(statusName, definition);
            }
        }
    }]);

    app.run(["$rootScope", "$injector", "$state", "$injector", function ($rootScope, $injector, $state, $injector) {
        // 绑定路由
        $app.router = {go: $state.go, is: $state.is, includes: $state.includes, reload: $state.reload};
        // 绑定注入器
        $app.injector = $injector;
        // 扩展 Controller 默认 继承 BaseController
        $injector._invoke = $injector.invoke;
        $injector.invoke = function (fn, self, locals, serviceName) {
            if (angular.isUndefined(serviceName) && angular.isArray(fn) && locals && locals.$element) {
                $controller(fn);
            }
            return $injector._invoke(fn, self, locals, serviceName);
        }
        $injector._instantiate = $injector.instantiate;
        $injector.instantiate = function (type, locals, serviceName) {
            $controller(type);
            return $injector._instantiate(type, locals, serviceName);
        }
    }]);


    // 左侧遍栏菜单
    var sidebar = {
        /**
         * 添加侧边栏菜单
         * @param menu {text:'基础数据',icon:'basic',state:'basic.info.area.index',includes:'basic'}
         */
        add: function (menu) {
            $app.defaults.sidebar.push(menu)
        },
        /**
         * 清空菜单
         */
        clear: function () {
            $app.defaults.sidebar.splice(0, $app.defaults.sidebar.length);
        }
    }
    /**
     * 代理 Angular 核心方法
     * @type {{config, factory, constant, run}}
     */
    return {
        value: app.value, constant: app.constant, config: app.config, run: app.run, factory: app.factory, directive: app.directive, component: app.component,
        controller: wrapController, $controller: $controller, service: wrapService,
        sidebar: sidebar
    }
}