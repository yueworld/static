module.exports = function () {
    var getArg = function (args, index) {
        return Array.prototype.slice.call(args, index || 0)
    }, $rootScope = {};
    var BaseController = function () {
    }
    BaseController.prototype = {
        init: function ($scope) {
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
    return {
        wrapController: function ($module) {
            var module = $module, controller = module.controller, self = this;
            module.run(["$rootScope", function (rootScope) {
                $rootScope = rootScope;
            }]);
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
        }
    }
}