/**
 * modal.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 弹出框
 */
module.exports = function ($app) {
    // ESC 关闭窗口事件
    var $scopes = [];
    $app.el.document.keyup(function (event) {
        if (event.keyCode == 27 || event.keyCode == 96) {
            $scopes = $scopes.filter(function ($scope, $index) {
                if ($index == $scopes.length - 1) {
                    $scope.option.deferred.resolve({execute: false, values: []});
                    $scope.close();
                } else {
                    return $scope
                }
            })
        }
    })

    /**
     * 自定义模态弹出框
     */
    // 自定义模态对话框
    // 实例：
    // $app.modal({
    //     template: require("xx.html"),
    //     controller: require("xxx")($app),
    //     resolve: {
    //         ....
    //     }
    // });
    function parseResolve(invocables) {
        var $injector = $app.injector, $q = $injector.get("$q"), promises = [];
        angular.forEach(invocables, function (value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
                promises.push($q.resolve($injector.invoke(value)));
            } else if (angular.isString(value)) {
                promises.push($q.resolve($injector.get(value)));
            } else {
                promises.push($q.resolve(value));
            }
        });
        return $q.all(promises).then(function (resolves) {
            var resolveObj = {};
            var resolveIter = 0;
            angular.forEach(invocables, function (value, key) {
                resolveObj[key] = resolves[resolveIter++];
            });
            return resolveObj;
        });
    }

    function modal(config, overwrite) {
        return $app.injector.invoke(["$rootScope", "$animate", "$q", "$timeout", "$compile", "$controller", function ($rootScope, $animate, $q, $timeout, $compile, $controller) {
            var // 新作用域
                $scope = $rootScope.$new(),
                option = $scope.option = angular.extend({
                    // 模版
                    template: "<h2>弹窗内容未配置</h2>",
                    // 控制器
                    controller: [angular.noop],
                    // 解析、注入对象
                    resolve: {empty: true},
                    // 默认宽度
                    width: 600,
                    // 异步通知对象
                    deferred: $q.defer()
                }, config, overwrite);

            function open(resolveObj) {
                var $backdrop = $app.backdrop(),
                    $modal = $app.$('<div class="ys-platform-modal"><div class="col-xs-12 ys-platform-p0 ys-platform-container"></div></div>'),
                    $container = $modal.find(".ys-platform-container").css({width: option.width}).addClass(option.class ? option.class : "");
                $scope.close = function ($callback) {
                    $animate.removeClass($container, "in").then(function () {
                        $scope.$destroy();
                        $scopes = $scopes.filter(function (_$scope) {
                            return $scope != _$scope;
                        })
                    })
                    $backdrop.hide().then(function () {
                        if (angular.isFunction($callback)) {
                            $callback();
                        }
                    });
                }
                var locals = angular.extend({$element: $container}, resolveObj, {$scope: angular.extend($scope.$new(), option)});
                try {
                    $controller(option.controller, locals);
                } catch (ex) {
                    console.error(ex)
                }
                $container.append($compile(option.template)(locals.$scope));
                $modal.appendTo($app.el.container)
                $timeout(function () {
                    $animate.addClass($container, "in").then(function () {
                        option.deferred.notify("show");
                    })
                });
                $scope.$on("$destroy", function () {
                    $modal.remove();
                })
                $scopes.push($scope);
            }

            if (option.resolve.empty) {
                // 不存在需要 resolve 的对象
                open({})
            } else {
                $app.loading(true);
                parseResolve(option.resolve).then(function (resolveObj) {
                    $app.loading(false);
                    open(resolveObj)
                });
            }
            return option.deferred.promise;
        }])
    }

    $app.modal = modal;
}