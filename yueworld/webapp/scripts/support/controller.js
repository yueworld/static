var BaseController = function () {
}
BaseController.prototype = {
    init: function ($scope, definition) {
        var self = this;
        definition = definition || {};
        self.filter = $scope.filter = $app.router.params;
        self.listOptions = $scope.listOptions = angular.extend({}, definition.list, {filter: self.filter});// 载入页面
        self.reload = $scope.reload = function () {
            return $app.router.go($app.router.name, self.filter, {reload: true});
        }
        // 添加菜单
        $app.setTopSubBarMenus(definition.toolbars);
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
};

var ListController = function () {
}
ListController.prototype = {
    init: function ($scope, definition) {
        var self = this;
        definition = definition || {};
        self.filter = $scope.filter = $app.router.params;
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
        $app.setTopSubBarMenus(definition.toolbars);
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
};

module.exports = {
    // 包装 Controller
    wrapController: function (module) {
        var controller = module.controller;
        return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            var constructor = args[1];
            if (angular.isArray(constructor)) {
                constructor = constructor[constructor.length - 1];
            }
            angular.extend(constructor.prototype, BaseController.prototype);
            // constructor.prototype.getModel = modelFactory.getModel;
            return controller.apply(module, args)
        }
    },
    // 包装 stateController
    wrapStateController: function (controller) {
        try {
            if (controller) {
                var constructor = controller;
                if (angular.isArray(constructor)) {
                    constructor = constructor[constructor.length - 1];
                }
                angular.extend(constructor.prototype, ListController.prototype);
                // console.log(controller)
            }
        } catch (ex) {
            console.log(ex);
        }
    }
}