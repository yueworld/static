/**
 * 包装 Controller
 * @param module
 */
function wrapController(module) {
    var controller = module.controller;
    return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var constructor = args[1];
        if (angular.isArray(constructor)) {
            constructor = constructor[constructor.length - 1];
        }
        angular.extend(constructor.prototype, {
            init: function ($scope, definition) {
                var self = this;
                definition = definition || {};
                self.filter = $scope.filter = $app.helper.extend(definition.filter || {}, $app.router.params, true);
                self.listOptions = $scope.listOptions = angular.extend({}, definition.list, {filter: self.filter});// 载入页面
                self.reload = $scope.reload = function () {
                    return $app.router.go($app.router.name, self.filter, {reload: true});
                }
                if (definition.reload) {
                    $scope.$watch(definition.reload, function (n, o) {
                        if (n != o) {
                            self.reload();
                        }
                    })
                }
                // 添加菜单
                $app.setTopSubBarMenus && $app.setTopSubBarMenus(definition.toolbars);
                this.$scope = $scope;
                return this;
            }, $on: function () {
                if (this.$scope === undefined) {
                    throw new Error("Controller未初始化，请先执行 this.init($scope) 进行初始化");
                }
                var args = getArg(arguments, 0), destroyCallback = $rootScope.$on.apply($rootScope, args);
                this.$scope.$on("$destroy", function () {
                    angular.isFunction(destroyCallback) && destroyCallback()
                })
            }, $publish: function () {
                $rootScope.$emit.apply(this.$rootScope, getArg(arguments, 0))
            }
        });
        return controller.apply(module, args)
    }
}

/**
 * 包装 stateController
 * @param controller
 */
function wrapStateController(controller) {
    try {
        if (controller) {
            var constructor = controller;
            if (angular.isArray(constructor)) {
                constructor = constructor[constructor.length - 1];
            }
            angular.extend(constructor.prototype, {
                init: function ($scope, definition) {
                    var self = this;
                    definition = definition || {};
                    self.filter = $scope.filter = $app.helper.extend(definition.filter || {}, $app.router.params, true);
                    self.listOptions = $scope.listOptions = angular.extend({}, definition.list, {filter: self.filter});// 载入页面
                    self.reload = $scope.reload = function () {
                        return $app.router.go($app.router.name, self.filter, {reload: true});
                    }
                    if (definition.reload) {
                        $scope.$watch(definition.reload, function (n, o) {
                            if (n != o) {
                                self.reload();
                            }
                        })
                    }
                    // 添加菜单
                    angular.forEach(definition.toolbars, function (bar) {
                        if (!bar.click) {
                            if (bar.command == "add") {
                                bar.click = function () {
                                    self.filter.add = !self.filter.add;
                                }
                            }
                        }
                    })
                    $app.setTopSubBarMenus && $app.setTopSubBarMenus(definition.toolbars);
                    this.$scope = $scope;
                    return this;
                }, $on: function () {
                    if (this.$scope === undefined) {
                        throw new Error("Controller未初始化，请先执行 this.init($scope) 进行初始化");
                    }
                    var args = getArg(arguments, 0), destroyCallback = $rootScope.$on.apply($rootScope, args);
                    this.$scope.$on("$destroy", function () {
                        angular.isFunction(destroyCallback) && destroyCallback()
                    })
                }, $publish: function () {
                    $rootScope.$emit.apply(this.$rootScope, getArg(arguments, 0))
                }
            });
            // console.log(controller)
        }
    } catch (ex) {
        console.log(ex);
    }
}

/**
 * 包装 Router
 */
function wrapRouter(app) {
    var router = {};
    // 通用配置
    app.config(["$stateProvider", function ($stateProvider) {
        // 默认路由注册
        router.default = function (statusName, url, template, controller, resolve) {
            $stateProvider.state(statusName, {
                url: url, "abstract": true,
                template: template ? template : '<div class="col-xs-12 ys-platform-p0 ys-platform-bg-white animated-ui-view fadeIn fadeOut" ui-view></div>',
                controller: controller, resolve: resolve
            });
        }
        // 定制路由注册
        router.register = function (statusName, url, template, controller, resolve) {
            wrapStateController(controller)
            var definition = {url: url, controller: controller, resolve: resolve};
            if ($app.valid.startsWith(template, "url:")) {
                definition.templateUrl = template.substr(4);
            } else if ($app.valid.startsWith(template, "find:")) {
                definition.template = $app.$(template.substr(5)).html();
            } else {
                definition.template = template ? template : '';
            }
            $stateProvider.state(statusName, definition);
        }

    }])
    // 启动初始化
    app.run(["$state", function ($state) {
        router.go = $state.go;
        router.is = $state.is;
        router.includes = $state.includes;
        router.reload = $state.reload;
    }])
    return router;
}

/**
 * 包装 Service
 */
function wrapService($app, app) {
    /**
     * @param option {name,url,refreshDictionary,init}
     */
    function service(option) {
        option = angular.extend({
            url: "sdk/xxx/xx/xx", dictionary: false, init: function (requestService) {
                return {};
            }
        }, option)
        app.factory($app.helper.firstUpperCase(option.name) + "Service", ["RequestService", function (requestService) {
            var object = {
                // 新增、修改
                publish: function (input) {
                    var self = this;
                    return requestService.post(option.url, {params: angular.extend({action: 1002}, {input: angular.toJson(input)})}).finally(function () {
                        if (option.dictionary) {
                            self.refreshDictionary();
                        }
                    });
                },
                // 删除
                drop: function (id) {
                    var self = this;
                    return requestService.post(option.url, {params: {action: 1003, id: id}}).finally(function () {
                        if (option.dictionary) {
                            self.refreshDictionary();
                        }
                    });
                },
                // 分页
                findPager: function (params) {
                    return requestService.get(option.url, {params: angular.extend({action: 1001}, params)});
                },
                // 快速查询
                quick: function (params) {
                    return requestService.get(option.url, {params: angular.extend({action: 1004}, params)});
                },
                // 详情
                detail: function (id) {
                    return requestService.get(option.url, {params: angular.extend({action: 1005}, {id: id})});
                },
                // 刷新数据字典
                refreshDictionary: function () {
                    return this.quick().then(function ($response) {
                        $app.dictionary[option.name.toUpperCase() + "S"] = $app.dictionary.build($response.data.data);
                    })
                }
            }
            return angular.extend(object, option.init(requestService))
        }]);
    }

    /**
     * 批量注册 服务
     * @param urlPrefix 访问地址 前缀
     * @param options   数组：  string|{name:"xxx",init:function(requestService){...}}
     */
    function register(urlPrefix, options) {
        angular.forEach([].concat(options), function (option) {
            if (angular.isString(option)) {
                service({name: option, url: urlPrefix + option})
            } else if (angular.isObject(option)) {
                service(angular.extend(option, {url: urlPrefix + option.name}));
            }
        })
    }

    /**
     * 字典服务注册
     * @param urlPrefix
     * @param options
     */
    function dictionary(urlPrefix, options) {
        register(urlPrefix, [].concat(options).map(function (value) {
            if (angular.isString(value)) {
                return {name: value, dictionary: true};
            } else {
                value.dictionary = true;
                return value;
            }
        }));
    }

    return {
        // 字典服务注册
        dictionary: dictionary,
        // 常规服务注册
        register: register
    };
}

module.exports = {
    // 包装 Controller
    wrapController: wrapController,
    // 包装 stateController
    wrapStateController: wrapStateController,
    // 包装 Router
    wrapRouter: wrapRouter,
    // 包装 Service
    wrapService: wrapService
}