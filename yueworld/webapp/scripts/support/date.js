module.exports = function ($app) {
    // 日期处理
    // ========================================== Date Helper ==========================================================

    /**
     * string|number -> date
     *
     * @param value
     * @returns {*}
     */
    function parse(value) {
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
    }

    /**
     * date -> string
     * @param expr    表达式
     * @param date    日期
     * @returns {*}
     */
    function format(expr, date) {
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
                "ms": date.getMilliseconds(),//毫秒
                // 当月最后一天
                "md": new Date(date.getFullYear(), date.getMonth(), 0).getDate()
            }
            if (/(y+)/.test(expr)) {
                expr = expr.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(expr)) {
                    expr = expr.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return expr;
        }
    }

    /**
     * 日期加减
     * @param date      日期
     * @param expr      y、m、d、w、h、n、s、l
     * @param value     数值
     * @returns Date
     */
    function add(date, expr, value) {
        $app.assert.isTrue(!$app.valid.isDate(date), "日期格式错误！");
        $app.assert.isTrue(!/y|M|d|w|h|m|s|ms/.test(expr), "表达式格式错误、可选范围(y、M、d、w、h、m、s、ms)！");
        $app.assert.isTrue(!$app.valid.isNumber(value), "数值式格式错误、必须为数字！");
        expr = expr.toUpperCase();
        if (/^\d+$/.test(date)) {
            date = new Date(Number(date));
        } else if (angular.isString(date)) {
            date = this.parse(date);
        }
        switch (expr) {
            case "y":
                date.setFullYear(date.getFullYear() + value);
                break;
            case "M":
                date.setMonth(date.getMonth() + value);
                break;
            case "d":
                date.setDate(date.getDate() + value);
                break;
            case "w":
                date.setDate(date.getDate() + 7 * value);
                break;
            case "h":
                date.setHours(date.getHours() + value);
                break;
            case "m":
                date.setMinutes(date.getMinutes() + value);
                break;
            case "s":
                date.setSeconds(date.getSeconds() + value);
                break;
            case "ms":
                date.setMilliseconds(date.getMilliseconds() + value);
                break;
        }
        return date;
    }

    /**
     * 日期比较
     * @param start
     * @param end
     * @returns {start,end,year,month,day}
     */
    function compare(start, end) {
        $app.assert.isTrue(!$app.valid.isDate(start), "开始日期格式错误!");
        $app.assert.isTrue(!$app.valid.isDate(end), "结束日期格式错位!");
        var min = parse(start),
            max = parse(end);
        if (min.getTime() > max.getTime()) {
            min = parse(end);
            max = parse(start);
        }
        var result = {min: min, max: max};
        var year = format("yyyy", max) - format("yyyy", min),
            month = format("MM", max) - format("MM", min),
            day = format("dd", max) - format("dd", min);
        if (day < 0) {
            month -= 1;
            max = add(max, "M", -1);
            day = day + format("md", max);
        }
        // 如果day==最后一个月最大天数，则month+1,day=0
        if (day == format("md", max)) {
            month = month + 1;
            day = 0;
        }
        if (month < 0) {
            month = (month + 12) % 12;
            year--;
        }
        if (month == 12 && day == 0) {
            year = year + 1;
            month = 0;
            day = 0;
        }
        result.year = year;
        result.month = month;
        result.day = day;
        return result;
    }

    /**
     * 获取两个日期之间的间隔、文本描述
     * @param start
     * @param end
     * @param format   y年m个月d天
     */
    function spacingText(start, end, format) {
        $app.assert.isTrue(!$app.valid.isDate(start), "开始日期格式错误!");
        $app.assert.isTrue(!$app.valid.isDate(end), "结束日期格式错位!");
        var result = compare(start, end);
        if (!format) {
            format = "";
            if (result.year > 0) {
                format = "y年";
            }
            if (result.month > 0) {
                format += "m个月";
            }
            if (result.day > 0) {
                format += "d天";
            }
        }
        return format.replace("y", result.year).replace("m", result.month).replace("d", result.day);
    }

    /**
     * 获取间隔年周期
     * @param start
     * @param end
     * @returns [{start:date,end:date,index:number,year:number,day:number}]
     */
    function spacingYear(start, end) {
        $app.assert.isTrue(!$app.valid.isDate(start), "开始日期格式错误!");
        $app.assert.isTrue(!$app.valid.isDate(end), "结束日期格式错位!");
        var result = compare(start, end);
        // 获取间隔年数
        var countYear = result.getMonth() > 0 || result.getDay() > 0 ? result.getYear() + 1 : result.getYear();
        var cycles = [];
        for (var i = 0; i < countYear; i++) {
            var cycle = {
                index: i + 1,
                year: format("yyyy", result.start),
                start: format("yyyy-MM-dd", result.start),
                end: format("yyyy-MM-dd", add(result.start, "y", 1)),
            };
            if (parse(cycle.end).getTime() > result.end.getTime()) {
                cycle.end = result.end;
            }
            cycle.day = (parse(cycle.end).getTime() - parse(cycle.start)) / (86400 * 1000) + 1;
            cycles.push(cycle);
        }
        return cycles;
    }

    /**
     * 取毫秒
     * @param value
     * @returns {any}
     */
    function toMs(value) {
        var rs = this.parse(value);
        return rs ? rs.getTime() : "";
    }

    // 取最小时间
    function min(d1, d2) {
        d1 = this.parse(d1);
        d2 = this.parse(d2);
        if (!d1) {
            return d2;
        } else if (!d2) {
            return d1;
        }
        return d1.getTime() < d2.getTime() ? d1 : d2;
    }

    // 取最大时间
    function max(d1, d2) {
        d1 = this.parse(d1);
        d2 = this.parse(d2);
        if (!d1) {
            return d2;
        } else if (!d2) {
            return d1;
        }
        return d1.getTime() > d2.getTime() ? d1 : d2;
    }


    function msToText(duration) {
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

    $app.date = {
        // 当前日期
        now: new Date(),
        // string|number -> date
        parse: parse,
        // date -> string
        format: format,
        // 日期加减
        add: add,
        // 日期比较
        compare: compare,
        // 取毫秒
        toMs: toMs,
        // 取最小时间
        min: min,
        // 取最大时间
        max: max,
        // 获取两个日期之间的文本周期
        spacingText: spacingText,
        // 获取两个日期之间的时间周期
        spacingYear: spacingYear,
        // 毫秒转文本
        msToText: msToText
    }

}