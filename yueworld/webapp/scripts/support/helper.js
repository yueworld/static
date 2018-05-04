module.exports = function ($app) {
    // 数据处理
    // ========================================== DataHelper ==========================================================
    // 基础常用函数扩展
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        // 占位符
        placeholder = /\$\{([^{}]+)\}/g;

    /**
     * 剔除空格
     * @param value
     * @returns {string}
     */
    function trim(value) {
        return value == null ? "" : (value + "").replace(rtrim, "")
    }

    /**
     * 首字母大写
     * @param value
     */
    function firstUpperCase(value) {
        return value.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
            return $1.toUpperCase() + $2;
        });
    }

    /**
     *  编译字符串
     * @param expr          表达式、示例：欢迎${username}、使用系统！
     * @param parameters    {username:"超级管理员"}
     * @returns {*}
     */
    function template(expr, parameters) {
        var value;
        while ((value = placeholder.exec(expr))) {
            expr = expr.replace(value[0], parameters[value[1]] ? parameters[value[1]] : "${" + value[1] + " -> 未定义}");
        }
        return expr;
    }


    // 返回随机内容
    function random(option) {
        option = angular.extend({seed: 10, fractional: 0, size: 1, start: 1}, option);
        var sp = option.seed - option.start;
        if (option.size == 1) {
            return parseFloat(Math.random() * sp + option.start).toFixed(option.fractional);
        } else {
            var values = [];
            for (var i = 0; i < option.size; i++) {
                values.push(parseFloat(Math.random() * sp + option.start).toFixed(option.fractional))
            }
            return values;
        }
    }

    /**
     * 连接数组内某一属性的字符串
     * @param items
     * @param property
     * @param join
     * @returns {*|string}
     */
    function joinProperty(items, joinProperty, join) {
        return items.map(function (item) {
            return item[property];
        }).join(join);
    }


    // 后退
    function back() {
        window.history.back();
    }

    // 执行一段 JavaScript 并返回结果
    function executeScript(script, callback) {
        var method = "CALLBACK_" + $app.random({size: 32}).join("");
        var $elScript = $app.$("<script/>", {type: 'text/javascript'});
        window[method] = function (data) {
            window[method] = undefined;
            $elScript.remove();
            callback(data);
        }
        $elScript.append("window." + method + "(" + script + ")");
        $app.el.body.append($elScript);
    }

    // 继承、区别与 angular.extend  该方法只继承非 undefined 属性
    function extend(source, overwrite, isNotOverwriteUndefinedField) {
        if (!isNotOverwriteUndefinedField) {
            return angular.extend(source, overwrite)
        } else {
            var value = angular.extend(source, {});
            for (var field in overwrite) {
                if (overwrite[field]) {
                    value[field] = overwrite[field];
                }
            }
            return value;
        }
    }

    // 延迟执行、用于缓存Service执行结果
    // option={promise:function(){},trigger:function(){}}
    function lazyExecute(option) {
        if (!angular.isFunction(option.promise)) {
            $app.msgbox.error({message: "$app.lazyExecute promise 必须为 Function"})
        }
        if (!angular.isFunction(option.trigger)) {
            $app.msgbox.error({message: "$app.lazyExecute trigger 必须为 Function"})
        }
        return function () {
            try {
                if (!option.response || option.check && this.check != option.check()) {
                    $app.loading(true);
                    this.check = option.check ? option.check() : undefined;
                    option.promise().then(function ($response) {
                        option.response = $response;
                        option.trigger($response)
                    }).finally(function () {
                        $app.loading(false);
                    })
                } else {
                    option.trigger(option.response);
                }
            } catch (ex) {
                console.log(ex.message);
            }
        }
    }

    /**
     * 自动事件反注册
     * @param $scope
     * @param listeners
     */
    function autoDestroyEvent($scope, listeners) {
        $scope.$on("$destroy", function () {
            // 销毁全局注册事件
            angular.forEach(listeners, function (listener) {
                listener();
            })
        })
    }

    /**
     * 延迟响应 watch
     * @param fun
     * @param delay
     * @returns {Function}
     */
    function watch(fun/*监听函数*/, delay/*延迟执行时间*/) {
        var $timeout = $app.injector.get("$timeout"), promise = 0;
        return function (_old, _new) {
            $timeout.cancel(promise);
            promise = $timeout(function () {
                if (_old != _new) {
                    fun(_old, _new);
                }
            }, delay || 1);
        }
    }

    $app.helper = {
        // 剔除空格
        trim: trim,
        // 首字母大写
        firstUpperCase: firstUpperCase,
        // 编译格式化字符串、
        template: template,
        // 返回随机内容
        random: random,
        // 连接数组内某一属性的字符串
        joinProperty: joinProperty,
        // 后退
        back: back,
        // 执行一段 JavaScript 并返回结果
        es: executeScript,
        executeScript: executeScript,
        // 继承、区别与 angular.extend  该方法只继承非 undefined 属性
        extend: extend,
        // 延迟执行、用于缓存Service执行结果
        lazyExecute: lazyExecute,
        // 自动事件反注册
        ade: autoDestroyEvent,
        autoDestroyEvent: autoDestroyEvent,
        // 延迟响应 watch
        watch: watch
    }

}

