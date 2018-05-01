//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("RequestInterceptor", ["$q", function ($q) {
        return {
            response: function (response) {
                var data = response.data;
                if (data.code == 500) {
                    $app.publish("responseError", data.message, false);
                    response.ignoreErrorHandler = true;
                    return $q.reject(response);
                } else if (data.code == -100) {
                    $app.publish("needLogin", response.data.data, false);
                    response.ignoreErrorHandler = true;
                    return $q.reject(response);
                } else if (data.code == -99) {
                    response.ignoreErrorHandler = true;
                    $app.publish("sessionTimeout", response, false);
                    return $q.reject(response);
                }
                return response || $q.when(response);
            }, requestError: function (error) {
                // console.log("request error: " + error);
                return $q.reject(error)
            }, responseError: function (error) {
                if (error.status == -1 || error.status == 504 || error.status == 502) {
                    $app.publish("responseError");
                }
                // console.log("response error: ", error);
                return $q.reject(error)
            }
        }
    }]);
    $app.config(["$httpProvider", function ($http) {
        $http.interceptors.push("RequestInterceptor")
    }]);
    $app.factory("RequestService", ["$http", "$q", "$location", function ($http, $q, $location) {
        function RequestService(url, option) {
            if (!url) {
                throw new Error("RequestService -> url -> isEmpty");
            }
            if (!option.method) {
                throw new Error("RequestService -> option -> method -> isEmpty");
            }
            if (option.submitMessage) {
                // growl.addSuccessMessage(option.submitMessage);
            }
            option.headers = option.headers || {};
            if (option.params) {
                var _stk_ = $location.search()['_stk_'];
                if (_stk_) {
                    option.params["_stk_"] = _stk_;
                }
                if ($app.data.eq(option.method, "post") || $app.data.eq(option.method, "put")) {
                    option.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
                    option.data = $app.serialize(option.params);
                    delete option.params;
                } else {
                    for (var i in option.params) {
                        if (option.params[i] instanceof Date) {
                            option.params[i] = option.params[i].getTime();
                        }
                    }
                    if (option.cache) {
                        option.params.timestamp = $app.now.getTime();
                    }
                }
            }
            var result;
            if (option.method != "jsonp") {
                result = $http(angular.extend({timeout: 3 * 1000}, option, {url: url}));
            } else {
                result = $http.jsonp(url, option);
            }
            if (angular.isFunction(option.dataFormatter)) {
                result.then(function (result) {
                    return option.dataFormatter.apply(null, [result])
                });
            }
            result.then(function success(result) {
                var data = result.data, config = data.config;
                if (config) {
                    if (config.successMessage != undefined) {
                        // growl.addSuccessMessage(config.successMessage);
                    } else if (config.errorMessage != undefined) {
                        // growl.addErrorMessage(config.errorMessage);
                    }
                }
                return result;
            }, function error(result) {
                if (option.ignoreErrorHandler) {
                    return $q.reject(result);
                } else {
                    if (!result.ignoreErrorHandler) {
                        $app.publish("responseError", "当前请求失败，建议您刷新页面或者稍后重试。");
                    }
                    return $q.reject(result);
                }
            });
            return result;
        }

        return {
            get: function (url, option) {
                option = option || {};
                option.method = "get";
                return RequestService($app.getDynamicUrl(url), option);
            }, delete: function (url, option) {
                option = option || {};
                option.method = "delete";
                return RequestService($app.getDynamicUrl(url), option);
            }, post: function (url, option) {
                option = option || {};
                option.method = "post";
                return RequestService($app.getDynamicUrl(url), option);
            }, put: function (url, option) {
                option = option || {};
                option.method = "put";
                return RequestService($app.getDynamicUrl(url), option);
            }, jsonp: function (url, option) {
                option = option || {};
                option.method = "jsonp";
                return RequestService($app.getDynamicUrl(url), option);
            }
        };
    }]);
};
