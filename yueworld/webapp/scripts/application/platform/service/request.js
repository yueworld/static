//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    var httpStatus = {
        404: "Not Found",
        502: "Bad Gateway",
        504: "Gateway timeout"
    }
    $app.factory("RequestInterceptor", ["$q", function ($q) {
        return {
            // 可选，拦截成功的请求
            request: function (config) {
                /*console.log("Request：");
                console.log(config);*/
                return config || $q.when(config);
            },
            requestError: function (request) {
                console.log("RequestError：");
                console.log(request);
                return $q.reject(request)
            }, response: function (response) {
                var data = response.data;
                if (data.code == 500) {
                    $app.event.publish("responseError", data.message, false);
                    response.ignoreErrorHandler = true;
                    return $q.reject(response);
                } else if (data.code == -100) {
                    $app.event.publish("needLogin", response.data, false);
                    response.ignoreErrorHandler = true;
                    return $q.reject(response);
                }
                return $q.when(response);
            }, responseError: function (response) {

                // 502 Bad Gateway

                return $q.reject(response);
                /*if (response.status == -1 || response.status == 504 || response.status == 502) {
                }*/
                // return $q.when({data: {code: response.status, success: false}});// $q.when()/* $q.reject(response)*/;
                // console.log("response error: ", error);
                // return $q.reject(response)
                /*result.then(function success(result) {
                    if (result.data && result.data.message) {
                        if (result.data.success) {
                            $app.tip.success({message: result.data.message})
                        } else {
                            $app.tip.error({message: result.data.message})
                        }
                    }
                    return result;
                }, function error(result) {
                    console.log(result)
                    if (!result.ignoreErrorHandler) {
                        $app.event.publish("responseError", "当前请求失败，建议您刷新页面或者稍后重试。");
                    }
                    return $q.reject(result);
                });*/
            }
        }
    }]);
    $app.config(["$httpProvider", function ($http) {
        // $http.interceptors.push("RequestInterceptor")
    }]);
    $app.factory("RequestService", ["$http", "$q", "$location", function ($http, $q, $location) {
        function RequestService(url, option) {
            if (!url) {
                throw new Error("RequestService -> url -> isEmpty");
            }
            if (!option.method) {
                throw new Error("RequestService -> option -> method -> isEmpty");
            }
            if (option.tip) {
                option.tip = true;
            }
            option.headers = option.headers || {};
            if (option.params) {
                var _stk_ = $location.search()['_stk_'];
                if (_stk_) {
                    option.params["_stk_"] = _stk_;
                }
                if ($app.valid.eq(option.method, "post") || $app.valid.eq(option.method, "put")) {
                    option.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
                    option.data = $app.json.serialize(option.params);
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
                result = $http(angular.extend({timeout: 30 * 1000}, option, {url: url}));
            } else {
                result = $http.jsonp(url, option);
            }
            if (angular.isFunction(option.formatter)) {
                result.then(function (result) {
                    return option.formatter(result);
                });
            }
            result.then(function success(response) {
                var data = response.data;
                // 异常处理
                if (data.code == 500) {
                    $app.event.publish("responseError", data.message, false);
                    return $q.reject(response);
                } else if (data.code == -100) {
                    $app.event.publish("needLogin", response.data, false);
                    return $q.reject(response);
                } else if (data.message && response.config.tip) {
                    if (data.success) {
                        $app.tip.success({message: data.message});
                    } else {
                        $app.tip.error({message: data.message});
                    }
                }
                return $q.when(response);
            }, function error(response) {
                if (httpStatus[response.status]) {
                    $app.event.publish("responseError", $app.helper.template("${url}<br/>${status} ${message}", {
                        status: response.status, message: httpStatus[response.status], url: response.config.url
                    }));
                }
            })
            return result;
        }

        return {
            get: function (url, option) {
                option = option || {};
                option.method = "get";
                return RequestService($app.url.getDynamicUrl(url), option);
            }, delete: function (url, option) {
                option = option || {};
                option.method = "delete";
                return RequestService($app.url.getDynamicUrl(url), option);
            }, post: function (url, option) {
                option = option || {};
                option.method = "post";
                return RequestService($app.url.getDynamicUrl(url), option);
            }, put: function (url, option) {
                option = option || {};
                option.method = "put";
                return RequestService($app.url.getDynamicUrl(url), option);
            }, jsonp: function (url, option) {
                option = option || {};
                option.method = "jsonp";
                option.jsonpCallbackParam = "jsonpCallbackParam";
                return RequestService($app.url.getDynamicUrl(url), option);
            }
        };
    }]);
};
