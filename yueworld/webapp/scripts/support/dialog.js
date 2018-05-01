/**
 * dialog.js
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
    // $app.dialog.modal({
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

    function modal($option) {
        return (function ($rootScope, $animate, $q, $timeout, $compile, $controller) {
            var $scope = $rootScope.$new(),
                option = $scope.option = angular.extend({
                    resolve: {empty: true}, controller: [angular.noop], width: 600, deferred: $q.defer()
                }, $option);

            function open(resolveObj) {
                var $backdrop = $app.backdrop(),
                    $modal = $app.$('<div class="ys-framework-dialog ys-framework-dialog-modal"><div class="col-xs-12 p0 container"></div></div>'),
                    $container = $modal.find(".container").css({width: option.width});
                $scope.close = function ($callback) {
                    $animate.removeClass($container, "in");
                    $timeout(function () {
                        $backdrop.hide().then(function () {
                            if (angular.isFunction($callback)) {
                                $callback();
                            }
                            $scope.$destroy();
                            $scopes = $scopes.filter(function (_$scope) {
                                return $scope != _$scope;
                            })
                        });
                    }, 75)
                }
                if (!option.template) {
                    option.template = "<h2>未提表单内容</h2>";
                }
                var locals = angular.extend({$element: $container}, resolveObj, {$scope: angular.extend($scope.$new(), option)});
                try {
                    $controller(option.controller, locals);
                } catch (ex) {
                    console.debug(ex.message)
                }
                $container.append($compile(option.template)(locals.$scope));
                $modal.appendTo($app.el.body)
                $timeout(function () {
                    $animate.addClass($container, "in").then(function () {
                        option.deferred.notify("show");
                        if ($app.el.loading.is(":visible")) {
                            // $backdrop.hide()
                        }
                    })
                }, 75);
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
        })($app.injector.get("$rootScope"), $app.injector.get("$animate"), $app.injector.get("$q"), $app.injector.get("$timeout"), $app.injector.get("$compile"), $app.injector.get("$controller"));
    }

    // 消息提示
    function message($option) {
        return $app.dialog.modal(angular.extend({
            title: false, message: false, width: 480, buttons: [{text: "知道啦", result: true}],
            template: "<div class='col-xs-12 p0 ys-framework-dialog-msg'>" +
            "   <div class=\"col-xs-12 p0 header\" ng-if=\"option.title\" ng-bind=\"option.title\"></div>\n" +
            "        <div class=\"col-xs-12 p0 body\" ng-bind-html=\"option.message\"\n" +
            "        ng-class=\"{'error':'alert-danger','confirm':'alert-warning','warning':'alert-warning','info':'alert-info','success':'alert-success'}[option.action]\"></div>\n" +
            "        <div class=\"col-xs-12 footer p0\" ng-if=\"option.buttons.length==2\">\n" +
            "            <div class=\"col-xs-6\" ng-repeat=\"bt in option.buttons\" ng-bind=\"bt.text\"\n" +
            "                 ng-click=\"submit(bt.result)\"></div>\n" +
            "        </div>\n" +
            "        <div class=\"col-xs-12 footer p0\" ng-if=\"option.buttons.length==1\">\n" +
            "            <div class=\"col-xs-12\" ng-bind=\"option.buttons[0].text\"\n" +
            "                 ng-click=\"submit(option.buttons[0].result)\"></div>\n" +
            "        </div>\n" +
            "    </div>" +
            "</div>",
            controller: ["$scope", function ($scope) {
                var option = $scope.option;
                $scope.submit = function (execute) {
                    $scope.close(function () {
                        option.deferred.resolve({execute: execute});
                    })
                }
            }]
        }, $option));
    }

    $app.dialog = {
        modal: modal,
        // 确认对话框
        // 实例： $app.dialog.confirm({message:"xxx"})
        confirm: function (option) {
            return message(angular.extend({
                buttons: [{text: "取消", result: false}, {
                    text: "确定",
                    result: true
                }]
            }, option, {action: "confirm"}));
        },
        // 错误提示对框框
        // 实例： $app.dialog.error({message:"xxx"})
        error: function (option) {
            return message(angular.extend({/*title: "错误提示"*/}, option, {action: "error"}));
        },
        info: function (option) {
            return message(angular.extend({/*title: "消息提示"*/}, option, {action: "info"}));
        },
        // 操作成功提示对话框
        // 实例： $app.dialog.success({message:"xxx"})
        success: function (option) {
            return message(angular.extend({/*title: "完成提示"*/}, option, {action: "success"}));
        },
        // 警告对话框
        // 实例： $app.dialog.warning({message:"xxx"})
        warning: function (option) {
            return message(angular.extend({
                /*text: "警告提示",*/
                buttons: [{
                    text: "取消",
                    result: false
                }, {text: "确定", result: true}]
            }, option, {action: "warning"}));
        }
    };
}