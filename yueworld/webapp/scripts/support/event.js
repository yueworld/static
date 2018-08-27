module.exports = function ($app) {

    // ========================================== EventHelper  ===============================================

    /**
     * 发布事件
     * @param event
     * @param data
     * @param deferred
     */
    function publish(event, data, deferred) {
        return $app.injector.invoke(["$rootScope", "$q", function ($rootScope, $q) {
            if (deferred === true) {
                var defer = $q.defer();
                if (angular.isString(data)) {
                    data = {message: data, deferred: defer};
                } else {
                    data.deferred = defer;
                }
                $rootScope.$emit(event, data);
                return defer.promise;
            }
            $rootScope.$emit(event, data);
        }]);
    }

    /**
     * 订阅事件
     * @param event
     * @param callback
     */
    function subscribe(event, callback) {
        return $app.injector.invoke(["$rootScope", function ($rootScope) {
            return $rootScope.$on(event, callback)
        }]);
    };

    $app.event = {
        // 发布事件
        publish: publish,
        // 订阅事件
        subscribe: subscribe
    }
}