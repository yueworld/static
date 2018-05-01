module.exports = function ($app) {
    // 基础常用函数扩展
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    $app.window = $app.$(window);
    $app.el = {
        document: $app.$(document),
        body: $app.$("body"),
        loading: $app.$('div.ys-framework-loading')
    };
    $app.screen = {height: $app.window.height(), width: $app.window.width()};
    $app.now = new Date();
    // Loading
    $app.loading = function (show) {
        if (show) {
            $app.el.loading.show().addClass("in");
        } else {
            $app.injector.get("$animate").removeClass($app.el.loading, "in").then(function () {
                $app.el.loading.hide();
            });
            $app.injector.get("$timeout")(function () {
                $app.injector.get("$rootScope").$apply();
            })
        }
    }
    if ($app.el.loading.length == 0) {
        $app.el.loading = $app.$(require("../application/platform/views/loading.html")).appendTo($app.el.body);
    }
    if (!$app.setup.loading) {
        $app.el.loading.hide();
    }
    // 遮罩
    $app.backdrop = function () {
        var backdrop = $app.$('<div class="ys-framework-backdrop"></div>').appendTo($app.el.body),
            $animate = $app.injector.get("$animate"),
            $rootScope = $app.injector.get("$rootScope"),
            promise = $animate.addClass(backdrop, "in");
        $rootScope.$apply();

        function hide() {
            var _promise = $animate.removeClass(backdrop, "in").then(function () {
                backdrop.remove();
            })

            $rootScope.$apply();
            return _promise;
        }

        return {hide: hide, promise: promise}
    }
    // ========================================== Date Helper ==========================================================
    $app.date = {
        // 取最小时间
        min: function (d1, d2) {
            d1 = this.parse(d1);
            d2 = this.parse(d2);
            if (!d1) {
                return d2;
            } else if (!d2) {
                return d1;
            }
            return d1.getTime() < d2.getTime() ? d1 : d2;
        },
        // 取最大时间
        max: function (d1, d2) {
            d1 = this.parse(d1);
            d2 = this.parse(d2);
            if (!d1) {
                return d2;
            } else if (!d2) {
                return d1;
            }
            return d1.getTime() > d2.getTime() ? d1 : d2;
        },
        // 解析字符串到 Date
        parse: function (value) {
            if (!value) {
                return null;
            } else if (value instanceof Number) {
                return new Date(value);
            } else if (/^\d+$/.test(value)) {
                return new Date(Number(value));
            } else if (value instanceof String) {
                var s = value.split("-");
                return new Date(s[0], parseInt(s[1]) - 1, s[2]);
            } else if (value instanceof Date) {
                return value;
            }
        },
        toMilliseconds: function (value) {
            var rs = this.parse(value);

            return rs ? rs.getTime() : "";
        },
        // format格式化日期类型到字符串
        format: function (date, format) {
            if (date) {
                if (/^\d+$/.test(date)) {
                    date = new Date(Number(date));
                }
                var o = {
                    "M+": date.getMonth() + 1, //月份
                    "d+": date.getDate(), //日
                    "h+": date.getHours(), //小时
                    "m+": date.getMinutes(), //分
                    "s+": date.getSeconds(), //秒
                    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                    "S": date.getMilliseconds() //毫秒
                }
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    }
                }
                return format;
            }
        },
        // 日期 加减
        add: function (date, expr, number) {
            if (/^\d+$/.test(date)) {
                date = new Date(Number(date));
            } else if (angular.isString(date)) {
                date = this.parse(date);
            }
            switch (expr) {
                case "y":
                    date.setFullYear(date.getFullYear() + number);
                    break;
                case "m":
                    date.setMonth(date.getMonth() + number);
                    break;
                case "d":
                    date.setDate(date.getDate() + number);
                    break;
                case "w":
                    date.setDate(date.getDate() + 7 * number);
                    break;
                case "h":
                    date.setHours(date.getHours() + number);
                    break;
                case "n":
                    date.setMinutes(date.getMinutes() + number);
                    break;
                case "s":
                    date.setSeconds(date.getSeconds() + number);
                    break;
                case "l":
                    date.setMilliseconds(date.getMilliseconds() + number);
                    break;
            }
            return date;
        },
        // 获取两个日期之间隔
        spacing: function (start, end, format) {
            start = angular.isDate(start) ? start : this.parse(start);
            end = angular.isDate(end) ? end : this.parse(end);
            if (!start || !end) {
                return
            }
            var year = end.getFullYear() - start.getFullYear();
            var month = end.getMonth() - start.getMonth();
            var day = end.getDate() - start.getDate() + 1;
            if (day < 0) {
                month -= 1;
                day = day + new Date(end.getFullYear(), end.getMonth(), 0).getDate();
            }

            if (month < 0) {
                month = (month + 12) % 12;
                year--;
            }
            if (!format) {
                format = "";
                if (year > 0) {
                    format = "y年m个月";
                } else if (month > 0) {
                    format = "m个月";
                }
                format += "d天";
            }
            return format.replace("y", year).replace("m", month).replace("d", day);
        },
        // 获取两个日期之间的年份
        years: function (start, end) {
            start = angular.isDate(start) ? start : this.parse(start);
            end = angular.isDate(end) ? end : this.parse(end);
            if (!start || !end) {
                return
            }
            var year = end.getFullYear() - start.getFullYear();
            var month = end.getMonth() - start.getMonth();
            var day = end.getDate() - start.getDate();
            if (year > 1) {

            }
        },
        millisecondToCn: function (duration) {
            if (!duration) {
                return "-";
            } else {
                if (duration > 8.64E7) {
                    return $app.number.divide(duration, 8.64E7, 2) + " 天"
                } else if (duration > 3600000) {
                    return $app.number.divide(duration, 3600000, 2) + " 时"
                } else if (duration > 60000) {
                    return $app.number.divide(duration, 60000, 2) + " 分"
                }
                return $app.number.divide(duration, 1000, 2) + " 秒";
            }
        }
    }

    // ========================================== Number Helper ==========================================================

    $app.number = {
        // 是否为整数
        isInteger: function (obj) {
            return Math.floor(obj) === obj;
        },
        /*
         * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
         * @param floatNum {number} 小数
         * @return {object} {times:100, num: 314}
         */
        toInteger: function (floatNum) {
            var ret = {times: 1, num: 0};
            var isNegative = floatNum < 0;
            if (this.isInteger(floatNum)) {
                ret.num = floatNum;
                return ret;
            }
            var strfi = floatNum + '';
            var dotPos = strfi.indexOf('.');
            var len = strfi.substr(dotPos + 1).length;
            var times = Math.pow(10, len);
            var intNum = parseInt(Math.abs(floatNum) * times + 0.5, 10);
            ret.times = times;
            if (isNegative) {
                intNum = -intNum;
            }
            ret.num = intNum;
            return ret
        },
        /*
         * 核心方法，实现加减乘除运算，确保不丢失精度
         * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
         *
         * @param a {number} 运算数1
         * @param b {number} 运算数2
         * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
         * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
         *
         */
        calc: function (a, b, digits, op) {
            var o1 = this.toInteger(a);
            var o2 = this.toInteger(b);
            var n1 = o1.num;
            var n2 = o2.num;
            var t1 = o1.times;
            var t2 = o2.times;
            var max = t1 > t2 ? t1 : t2;
            var result = null;
            switch (op) {
                case 'add':
                    if (t1 === t2) { // 两个小数位数相同
                        result = n1 + n2
                    } else if (t1 > t2) { // o1 小数位 大于 o2
                        result = n1 + n2 * (t1 / t2)
                    } else { // o1 小数位 小于 o2
                        result = n1 * (t2 / t1) + n2
                    }
                    result = result / max;
                    break;
                case 'subtract':
                    if (t1 === t2) {
                        result = n1 - n2;
                    } else if (t1 > t2) {
                        result = n1 - n2 * (t1 / t2);
                    } else {
                        result = n1 * (t2 / t1) - n2;
                    }
                    result = result / max
                    break;
                case 'multiply':
                    result = (n1 * n2) / (t1 * t2);
                    break;
                case 'divide':
                    result = (n1 / n2) * (t2 / t1);
                    break;
            }
            var times = Math.pow(10, digits);
            var des = result * times + 0.5;
            des = parseInt(des, 10) / times;
            return des + ''
        },
        add: function (n1, n2, digits) {
            return this.calc(n1, n2, digits, "add");
        },
        subtract: function (n1, n2, digits) {
            return this.calc(n1, n2, digits, "subtract");
        },
        multiply: function (n1, n2, digits) {
            return this.calc(n1, n2, digits, "multiply");
        },
        divide: function (n1, n2, digits) {
            return this.calc(n1, n2, digits, "divide");
        }
    }
    // ========================================== Data Helper ==========================================================
    // Json To Url 序列化
    $app.serialize = function (e) {
        var t = "", r, i, s, o, u, a, f;
        for (r in e) {
            i = e[r];
            if (i instanceof Array) {
                for (f = 0; f < i.length; ++f) {
                    u = i[f],
                        a = {},
                        a[r] = u,
                        t += this.serialize(a) + "&";
                }
            } else if (i instanceof Object && !(i instanceof Date)) {
                for (o in i) {
                    u = i[o], s = r + "[" + o + "]",
                        a = {}, a[s] = u,
                        t += this.serialize(a) + "&";
                }
            } else if (i !== undefined && i !== null) {
                t += encodeURIComponent(r) + "=" + encodeURIComponent(i instanceof Date ? i.getTime() : i) + "&";
            }
        }
        return t.length ? t.substr(0, t.length - 1) : t
    }
    // 获取数字、小数位采用绝对值
    $app.getNumber = function (value, fractionalDigits) {
        if (isNaN(value) || value == undefined || value == Infinity) {
            return 0;
        } else {
            return parseFloat(value).toFixed(fractionalDigits);
        }
    }
    // 返回随机内容
    $app.random = function (option) {
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

    // ========================================== Data Helper ==========================================================
    $app.data = {
        range: function (length) {
            var value = [];
            for (var i = 0; i < length; i++) {
                value.push(i);
            }
            return value;
        },
        firstUpperCase: function (value) {
            return value.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
                return $1.toUpperCase() + $2;
            });
        },
        // 比较是否相等
        eq: function (source, target) {
            if (!source || !target) {
                return false;
            } else {
                return $app.data.trim(source).toUpperCase() == $app.data.trim(target).toUpperCase();
            }
        }, trim: function (value) {
            return value == null ? "" : (value + "").replace(rtrim, "")
        },
        // 替换占位符
        format: function () {
            var args = arguments;
            if (args[0]) {
                return args[0].replace(/\{\{|\}\}|\{(\d+)\}/g, function (word, index) {
                    if (word == "{{") {
                        return "{";
                    }
                    if (word == "}}") {
                        return "}";
                    }
                    index = parseInt(index, 10) + 1;
                    return args[index] ? args[index] : word;
                })
            }
        }
    }

    // ========================================== String Helper ========================================================
    // 开始是否相同
    $app.startWith = function (source, target) {
        if (target == null || target == "" || source.length == 0 || target.length > source.length) {
            return false;
        }
        return source.substr(0, target.length) == target;
    }
    // 结尾是否相同
    $app.endWith = function (source, target) {
        if (target == null || target == "" || source.length == 0 || target.length > source.length)
            return false;
        return source.substring(source.length - target.length) == target;
    }
    // 解码
    $app.decodeUnicode = function (str) {
        str = str.replace(/\\/g, "%");
        return unescape(str);
    }
    // ========================================== Cookie Helper ========================================================
    $app.cookie = {
        get: function (name, defaultValue) {
            if (!name) return;
            var values = document.cookie.split(";"), value;
            for (var index = 0; index < values.length; index++) {
                var i = values[index].split("=");
                i[0].trim() == name && (value = unescape(i[1]))
            }
            return (!value || value.lenght == 0 && defaultValue) ? defaultValue : value
        },
        set: function (value) {
            if (!value.name) return;
            var exp = new Date();
            exp.setTime(exp.getTime() + (value.day ? value.day : 30) * 24 * 60 * 60 * 1000);
            document.cookie = value.name + "=" + escape(value.value) + (value.domain ? ";domain=" + value.domain : "") + "; path=" + (value.path ? value.path : "/") + ";expires=" + exp.toGMTString();
        },
        eq: function (key, target) {
            return $app.data.eq(this.get(key), target);
        }
    };

    // ========================================== Url Helper ===========================================================
    // 读取URL参数
    $app.getParams = function (field) {
        var params = {};
        var queryString = window.location.search.substring(1);
        if (!queryString) {
            return "";
        } else {
            angular.forEach(queryString.split("&"), function (value) {
                var values = value.split("=");
                if (values.length > 1) {
                    params[values[0]] = values[1];
                }
            });
            return field ? params[field] : params;
        }
    }
    // 是否跨域
    $app.isCrossDomain = function (url) {
        return (url.indexOf("http") != -1 && url.indexOf(location.host) == -1) ? true : false;
    }
    // 设置和获取 URL 地址
    $app.dynamicUrl = $app.$("base").attr("href");
    $app.setDynamicUrl = function (url) {
        if (url.indexOf("http://") == -1) {
            $app.dynamicUrl = "http://" + location.host + url;
        } else {
            $app.dynamicUrl = url;
        }
    }
    $app.getDynamicUrl = function (url) {
        if (!url) {
            return $app.dynamicUrl
        } else if (url.indexOf("http://") != -1) {
            return url;
        } else {
            return $app.dynamicUrl + url;
        }
    }
    $app.staticUrl = "http://static.powerlong.com/";
    $app.setStaticUrl = function (url) {
        if (url.indexOf("http://") == -1) {
            $app.staticUrl = "http://" + location.host + url;
        } else {
            $app.staticUrl = url;
        }
    }
    $app.getStaticUrl = function (url) {
        if (!url) {
            return $app.staticUrl
        } else if (url.indexOf("http://") != -1) {
            return url;
        } else {
            return $app.staticUrl + url;
        }
    }

    // ========================================== Form =================================================================
    $app.form = {
        row: {
            slideToggle: function (option) {
                var //container = $app.$(option.event.currentTarget).parents(".ys-framework-product"),
                    container = option.container ? option.container : $app.$(option.event.currentTarget).parents("table:first"),
                    //panel = container.find("div.ys-framework-grid-form"),
                    panel = container.find(">tbody>tr>td>.ys-framework-grid-form"),
                    $timeout = $app.injector.get("$timeout"), deferred = $app.injector.get("$q").defer();
                // console.log(container.length+"===================")
                if (panel.length > 0) {
                    // 全部收起
                    panel.slideUp("fast", function () {
                        // $app.$(this).parents("tbody").removeClass("selected");
                        $app.$(this).parents("table:first>tbody").removeClass("selected");
                        $timeout(function () {
                            if (option.item) {
                                // console.log("1--------------------")
                                if (option.pager.editorSelectedItem == option.item) {
                                    option.pager.editorSelectedItem = undefined;
                                    deferred.resolve();
                                    //  console.log("1.1--------------------")
                                } else {
                                    option.pager.add = option.pager.editorSelectedItem = undefined;
                                    $app.form.row.slideToggle(option).then(function () {
                                        deferred.resolve();
                                    });
                                    // console.log("1.2--------------------")
                                }
                            } else {
                                // console.log("2--------------------")
                                if (option.pager.add) {
                                    //  console.log("2.1--------------------")
                                    option.pager.add = undefined;
                                    deferred.resolve();
                                } else {
                                    // console.log("2.2--------------------")
                                    option.pager.add = option.pager.editorSelectedItem = undefined;
                                    $app.form.row.slideToggle(option).then(function () {
                                        deferred.resolve();
                                    });
                                }

                            }
                        })
                    })
                } else if (option.item) {
                    // 展开
                    // console.log("3-----------------")
                    option.pager.editorSelectedItem = option.item;
                    $timeout(function () {
                        // container.find("div.ys-framework-grid-form").slideDown("fast").parents("tbody").addClass("selected");
                        container.find(">tbody>tr>td>.ys-framework-grid-form").slideDown("fast").parents("tbody").addClass("selected");
                    })
                } else {
                    // console.log("4-----------------")
                    option.pager.add = true;
                    $timeout(function () {
                        // container.find("div.ys-framework-grid-form").slideDown("fast")
                        container.find(">tbody>tr>td>.ys-framework-grid-form").slideDown("fast")
                    })
                }
                return deferred.promise;
            },
            /*
             * {
             *      service:"xxxxService",
             *      refresh:refresh,
             *      id:xxxx,
             *      message
             * }
             * */
            drop: function (option) {
                option = angular.extend({message: "您正在删除信息<br/>该操作不可恢复、确定执行？"}, option);
                var service = $app.injector.get($app.data.firstUpperCase(option.service) + "Service");
                $app.assert(!service, service + "Service" + "，服务未定义！");
                $app.dialog.confirm({message: option.message}).then(function (result) {
                    if (result.execute) {
                        $app.loading(true);
                        service.drop(option.id).then(function ($response) {
                            var response = $response.data;
                            if (response.success) {
                                if (option.refresh) {
                                    option.refresh().then(function () {
                                        $app.tip.success({message: "操作完成"});
                                    });
                                }
                            } else {
                                $app.dialog.error({message: response.message});
                                $app.loading(false);
                            }
                        })
                    }
                })
            }
        },
        /**
         * 选择
         * @param option.title 标题
         * @param option.input 模型
         * @param option.property 属性
         * @param option.dictionary 字典
         */
        select: function (option) {
            $app.dialog.select.simple(angular.extend({
                title: "请选择", values: (option.input[option.property] || "").split(","),
                items: angular.copy($app.dictionary[option.dictionary].options)
            }, option)).then(function (result) {
                if (result.execute) {
                    if (option.single && !option.multiple) {
                        angular.forEach(result.values, function (value) {
                            option.input[option.property] = value.id;
                        })
                    } else {
                        option.input[option.property] = $app.mapProperty(result.values, "id", ",");
                    }
                    console.log(option.input[option.property])
                }
            })
            // title, input, property, dictionary
            // console.log($parent.$parent.$app.dictionary.PROPERTY_TYPES.options)
        },
        // 表单事件绑定
        bind: function ($scope, method /*方法名*/, _option /*{loading:"等待提示",slide:"滑动特效",invoke:"待执行逻辑"}*/) {
            var $q = $app.injector.get("$q"), $timeout = $app.injector.get("$timeout"),
                option = angular.extend({
                    loading: true, slide: true, assert: angular.noop, invoke: function () {
                        var deferred = $q.defer();
                        deferred.resolve({data: {success: false, error: "未定义 invoke 逻辑！"}});
                        return deferred.promise;
                    }, success: function () {
                        if ($scope.refresh /*&& $scope.input && !$scope.input.id*/) {
                            $scope.refresh().then(function () {
                                $app.tip.success({message: "操作完成"});
                            })
                        } else {
                            $app.tip.success({message: "操作完成"});
                        }
                    }, error: function (data) {
                        $app.tip.error({message: data.message});
                    }
                }, _option)
            $scope[method] = function () {
                var args = Array.prototype.slice.call(arguments, 0);
                option.loading && $app.loading(true);
                try {
                    // 清理历史异常信息
                    if ($scope.input) {
                        $scope.input.errorCode = undefined;
                    }
                    // 验证
                    option.assert();
                    option.invoke.apply(this, args).then(function ($response) {
                        var response = $response.data;
                        if (response.success) {
                            if (option.slide && $scope.pager) {
                                if ($scope.input && $scope.input.id) {
                                    $app.form.row.slideToggle({
                                        event: args[0], pager: $scope.pager, item: $scope.input
                                    }).then(function () {
                                        option.success({args: args, message: "操作完成"});
                                    });
                                } else {
                                    $app.form.row.slideToggle({event: args[0], pager: $scope.pager}).then(function () {
                                        option.success({args: args, message: "操作完成"});
                                    });
                                }
                            } else {
                                option.success({args: args, message: response.message});
                            }
                        } else {
                            if ($scope.input) {
                                $timeout(function () {
                                    $scope.input.errorCode = response.code;
                                })
                            }
                            option.error({args: args, message: response.message});
                        }
                    }).finally(function () {
                        $app.loading(false);
                    })
                } catch (ex) {
                    if ($scope.input) {
                        $timeout(function () {
                            $scope.input.errorCode = ex.code;
                        })
                    }
                    $app.loading(false);
                    option.error({args: args, message: ex});
                }
            }
        }
    }
    // ========================================== Global Event   Helper  ===============================================
    $app.publish = function (event, data, deferred) {
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
    };
    $app.subscribe = function (event, callback) {
        return $app.injector.invoke(["$rootScope", function ($rootScope) {
            return $rootScope.$on(event, callback)
        }]);
    };
    // ========================================== Outer Helper ==========================================================
    // 连接数组内某一属性的字符串
    $app.mapProperty = function (items, property, join) {
        return items.map(function (item) {
            return item[property];
        }).join(join);
    }
    // 执行一段 JavaScript 并返回结果
    $app.executeScript = function (script, callback) {
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
    $app.buildPath = function (hash, item) {
        var name = item.text || item.name;
        if (hash[item.parentId]) {
            return $app.buildPath(hash, hash[item.parentId]) + " > " + name;
        } else {
            return name;
        }
    }
    // 将数组换换位 {has:{},options,root:{},tree:{}} 形式、方便初始化 select2 一级快速查找元素
    $app.buildOption = function (options, isBuildTree, filter) {
        var result = {all/*原始*/: [], options: options, hash: {}, root: {}, selected: []};
        angular.forEach(result.options, function (option) {
            result.hash[option.id] = option;
            if (option.id == "-1") {
                result.root = option;
            }
            if (!option.text) {
                if (option.name) {
                    option.text = option.name;
                } else if (option.title) {
                    option.text = option.title;
                }
            }
        })
        // 构建树
        if (isBuildTree) {
            angular.forEach(result.options, function (option) {
                if (option.parentId && (!filter || filter(option))) {
                    var parent = result.hash[option.parentId];
                    if (parent) {
                        var children = parent.children;
                        if (!children) {
                            children = parent.children = [];
                        }
                        children.push(option)
                    }
                }
                if (!option.path) {
                    option.path = $app.buildPath(result.hash, option);
                }
            })
        }
        return result;
    }
    // 断言
    $app.assert = function (success, message, code) {
        if (success) {
            var error = new Error(message);
            if (code) {
                error.code = code;
            }
            throw error;
        }
    }
    // 继承、区别与 angular.extend  该方法只继承非 undefined 属性
    $app.extend = function (source, overwrite, isNotOverwriteUndefinedField) {
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
    // 后退
    $app.back = function () {
        window.history.back();
    }
    // 延迟执行、用于缓存Service执行结果
    // option={promise:function(){},trigger:function(){}}
    $app.lazyExecute = function (option) {
        if (!angular.isFunction(option.promise)) {
            $app.dialog.error({message: "$app.lazyExecute promise 必须为 Function"})
        }
        if (!angular.isFunction(option.trigger)) {
            $app.dialog.error({message: "$app.lazyExecute trigger 必须为 Function"})
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
    // browser 浏览器版本
    var userAgent = navigator.userAgent.toLowerCase(),
        platform = navigator.platform.toLowerCase()
    $app.browser = {
        mozilla: /firefox/.test(userAgent),
        webkit: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        msie: /msie/.test(userAgent)
    };
    $app.platform = {
        window: platform.indexOf("win") != -1
    }
    $app.autoDestroyEvent = function ($scope, listeners) {
        $scope.$on("$destroy", function () {
            // 销毁全局注册事件
            angular.forEach(listeners, function (listener) {
                listener();
            })
        })
    }
    // 延迟响应 watch
    $app.watch = function (fun/*监听函数*/, delay/*延迟执行时间*/) {
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
    // ========================================== Cache Helper ==========================================================
    var $cache = {};
    $app.cache = {
        set: function (id, value) {
            $cache[id] = value;
            return value;
        }, get: function (id) {
            return $cache[id];
        }
    }
    // ========================================== 进入全屏、退出全屏 ======================================================
    $app.screen.fullscreen = function () {
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.msRequestFullscreen) {
            docElm = document.body;
            docElm.msRequestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
        $app.injector.invoke(["$timeout", function ($timeout) {
            $timeout(function () {
                $app.screen.isFullscreen = true;
            }, 300)
        }])
    }
    $app.screen.exitFullscreen = function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        $app.injector.invoke(["$timeout", function ($timeout) {
            $timeout(function () {
                $app.screen.isFullscreen = false;
            }, 300)
        }])
    }

    // ========================================== Native 扩展 ===========================================================
    /* 数组 方法扩展 */
    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.io/#x15.4.4.18
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, thisArg) {
            var T, k;
            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }
            // 1. Let O be the result of calling toObject() passing the
            // |this| value as the argument.
            var O = Object(this);
            // 2. Let lenValue be the result of calling the Get() internal
            // method of O with the argument "length".
            // 3. Let len be toUint32(lenValue).
            var len = O.length >>> 0;
            // 4. If isCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }
            // 5. If thisArg was supplied, let T be thisArg; else let
            // T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }
            // 6. Let k be 0
            k = 0;
            // 7. Repeat, while k < len
            while (k < len) {
                var kValue;
                // a. Let Pk be ToString(k).
                //    This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty
                //    internal method of O with argument Pk.
                //    This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {
                    // i. Let kValue be the result of calling the Get internal
                    // method of O with argument Pk.
                    kValue = O[k];
                    // ii. Call the Call internal method of callback with T as
                    // the this value and argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun /* , thisArg*/) {
            "use strict";
            if (this === void 0 || this === null)
                throw new TypeError();
            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function")
                throw new TypeError();
            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];
                    // NOTE: Technically this should Object.defineProperty at
                    //       the next index, as push can be affected by
                    //       properties on Object.prototype and Array.prototype.
                    //       But that method's new, and collisions should be
                    //       rare, so use the more-compatible alternative.
                    if (fun.call(thisArg, val, i, t))
                        res.push(val);
                }
            }

            return res;
        };
    }
    if (!Array.prototype.every) {
        Array.prototype.every = function (fun /*, thisArg */) {
            'use strict';

            if (this === void 0 || this === null)
                throw new TypeError();

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function')
                throw new TypeError();

            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && !fun.call(thisArg, t[i], i, t))
                    return false;
            }

            return true;
        }
    }
    // 实现 ECMA-262, Edition 5, 15.4.4.19
    // 参考: http://es5.github.com/#x15.4.4.19
    if (!Array.prototype.map) {
        Array.prototype.map = function (callback, thisArg) {

            var T, A, k;

            if (this == null) {
                throw new TypeError(" this is null or not defined");
            }

            // 1. 将O赋值为调用map方法的数组.
            var O = Object(this);

            // 2.将len赋值为数组O的长度.
            var len = O.length >>> 0;

            // 3.如果callback不是函数,则抛出TypeError异常.
            if (Object.prototype.toString.call(callback) != "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }

            // 4. 如果参数thisArg有值,则将T赋值为thisArg;否则T为undefined.
            if (thisArg) {
                T = thisArg;
            }

            // 5. 创建新数组A,长度为原数组O长度len
            A = new Array(len);

            // 6. 将k赋值为0
            k = 0;

            // 7. 当 k < len 时,执行循环.
            while (k < len) {

                var kValue, mappedValue;

                //遍历O,k为原数组索引
                if (k in O) {

                    //kValue为索引k对应的值.
                    kValue = O[k];

                    // 执行callback,this指向T,参数有三个.分别是kValue:值,k:索引,O:原数组.
                    mappedValue = callback.call(T, kValue, k, O);

                    // 返回值添加到新数组A中.
                    A[k] = mappedValue;
                }
                // k自增1
                k++;
            }

            // 8. 返回新数组A
            return A;
        };
    }
    // Production steps of ECMA-262, Edition 5, 15.4.4.21
    // Reference: http://es5.github.io/#x15.4.4.21
    // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
    if (!Array.prototype.reduce) {
        Object.defineProperty(Array.prototype, 'reduce', {
            value: function (callback /*, initialValue*/) {
                if (this === null) {
                    throw new TypeError('Array.prototype.reduce ' +
                        'called on null or undefined');
                }
                if (typeof callback !== 'function') {
                    throw new TypeError(callback +
                        ' is not a function');
                }
                // 1. Let O be ? ToObject(this value).
                var o = Object(this);
                // 2. Let len be ? ToLength(? Get(O, "length")).
                var len = o.length >>> 0;
                // Steps 3, 4, 5, 6, 7
                var k = 0;
                var value;

                if (arguments.length >= 2) {
                    value = arguments[1];
                } else {
                    while (k < len && !(k in o)) {
                        k++;
                    }
                    // 3. If len is 0 and initialValue is not present,
                    //    throw a TypeError exception.
                    if (k >= len) {
                        throw new TypeError('Reduce of empty array ' +
                            'with no initial value');
                    }
                    value = o[k++];
                }
                // 8. Repeat, while k < len
                while (k < len) {
                    // a. Let Pk be ! ToString(k).
                    // b. Let kPresent be ? HasProperty(O, Pk).
                    // c. If kPresent is true, then
                    //    i.  Let kValue be ? Get(O, Pk).
                    //    ii. Let accumulator be ? Call(
                    //          callbackfn, undefined,
                    //          « accumulator, kValue, k, O »).
                    if (k in o) {
                        value = callback(value, o[k], k, o);
                    }

                    // d. Increase k by 1.
                    k++;
                }
                // 9. Return accumulator.
                return value;
            }
        });
    }
    Array.prototype.some = function (e) {
        "use strict";
        if (this == null) throw new TypeError("Array.prototype.some called on null or undefined");
        if (typeof e != "function") throw new TypeError;
        var t = Object(this), n = t.length >>> 0, r = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < n; i++) if (i in t && e.call(r, t[i], i, t)) return !0;
        return !1
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;

            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 9. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
    Array.prototype.remove = function (value) {
        var dx = this.indexOf(value);
        if (-1 != dx) {
            if (isNaN(dx) || dx > this.length) {
                return false;
            }
            for (var i = 0, n = 0; i < this.length; i++) {
                if (this[i] != this[dx]) {
                    this[n++] = this[i]
                }
            }
            this.length -= 1
        }
    }
    Array.prototype.in = function (field, value) {
        for (var i = 0; i < this.length; i++) {
            if (this[i][field] && this[i][field] == value) {
                return true;
            }
        }
        return false;
    }
    // Date Json
    Date.prototype.toJSON = function () {
        return this.getTime();
    }
    Date.prototype.toString = function () {
        return this.getTime() + "";
    }
}