/**
 * Register
 * @param $app
 * @param app = angularModule
 */

module.exports = function ($app, app) {
    var controller = require("./controller")($app);


    /**
     * 包装扩展 Controller
     */
    function wrapController() {
        var args = Array.prototype.slice.call(arguments, 0);
        controller.extend(args[1])
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
                return angular.extend(object, object, service.factory(url, requestService, $app));
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
        // 扩展 Controller 默认 继承 controller.base
        $injector._invoke = $injector.invoke;
        $injector.invoke = function (fn, self, locals, serviceName) {
            if (angular.isUndefined(serviceName) && angular.isArray(fn) && locals && locals.$element) {
                controller.extend(fn);
            }
            return $injector._invoke(fn, self, locals, serviceName);
        }
        $injector._instantiate = $injector.instantiate;
        $injector.instantiate = function (type, locals, serviceName) {
            controller.extend(type);
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
        controller: wrapController, $controller: controller.extend, service: wrapService,
        sidebar: sidebar
    }
}