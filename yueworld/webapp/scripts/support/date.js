module.exports = function ($app) {
    // 日期处理
    // ========================================== Date Helper ==========================================================
    var regex = [
        /^\d{8}$/,                                          // 20180502                     yyyyMMdd
        /^\d{10}$/,                                         // 1525271112                   秒值
        /^\d{12}$/,                                         // 201805021232                 yyyyMMddHHmm
        /^\d{13}$/,                                         // 1525271088641                毫秒值
        /^\d{4}-\d{1,2}-\d{1,2}$/,                          // 2008-05-02                   yyyy-MM-dd
        /^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}$/,         // 2008-05-02 02:12             yyyy-MM-dd HH:mm
        /^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}:\d{1,2}$/, // 2008-05-02 02:12:12          yyyy-MM-dd HH:mm:ss
        /^\d{4}年\d{1,2}月\d{1,2}日$/,                       // 2008年05月02日                yyyy年MM月dd日
        /^\d{4}年\d{1,2}月\d{1,2}日\s\d{1,2}时\d{1,2}分$/     // 2008年05月02日 02时12分       yyyy年MM月dd日 HH时mm分
    ], toString = Object.prototype.toString;

    /**
     * string|number -> date
     *
     * @param value
     * @returns {*}
     */
    function parse(value) {
        try {
            $app.assert.isTrue(!$app.valid.isDate(value), "参数格式错误、转换日期失败！", 1001);
            if (toString.call(value) === '[object Date]') {
                return angular.copy(value);
            }
            value = String(value);
            for (var i = 0; i < regex.length; i++) {
                if (regex[i].test(value)) {
                    if (i == 0) {
                        // 20180502
                        return new Date(value.substring(0, 4), parseInt(value.substring(4, 6)) - 1, value.substring(6, 8));
                    } else if (i == 1) {
                        // 1525271112
                        return new Date(value * 1000);
                    } else if (i == 2) {
                        // 201805021232
                        return new Date(value.substring(0, 4), parseInt(value.substring(4, 6)) - 1, value.substring(6, 8), value.substring(8, 10), value.substring(10, 12));
                    } else if (i == 3) {
                        // 1525271088641
                        return new Date(Number(value));
                    } else if (i == 4) {
                        // 2008-05-02
                        value = value.split("-");
                        return new Date(value[0], parseInt(value[1]) - 1, value[2]);
                    } else if (i == 5) {
                        // 2008-05-02 02:12
                        var tmp1 = value.split(" ")[0].split("-"),
                            tmp2 = value.split(" ")[1].split(":");
                        return new Date(tmp1[0], tmp1[1], tmp1[2], tmp2[0], tmp2[1]);
                    } else if (i == 6) {
                        // 2008-05-02 02:12:12
                        var tmp1 = value.split(" ")[0].split("-"),
                            tmp2 = value.split(" ")[1].split(":");
                        return new Date(tmp1[0], tmp1[1], tmp1[2], tmp2[0], tmp2[1], tmp2[2]);
                    } else if (i == 7) {
                        // 2008年05月02
                        return new Date(value.substring(0, 4), value.substring(5, 7), value.substring(8, 10));
                    } else if (i == 8) {
                        // 2008年05月02日 02时12分
                        return new Date(value.substring(0, 4), value.substring(5, 7), value.substring(8, 10), value.substring(12, 14), value.substring(15, 17));
                    }
                }
            }
            $app.isTrue(true, "未被支持的日期格式：" + value, 1002);
        } catch (ex) {
            console.log(ex)
        }
        return value;
    }

    /**
     * date -> string
     * @param expr    表达式
     * @param date    日期
     * @returns {*}
     */
    function format(expr, date) {
        date = parse(date);
        var o = {
            "ms": date.getMilliseconds(), // 毫秒
            "md": new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(), // 当月最后一天 MaxDay
            "M+": date.getMonth() + 1, // 月份
            "d+": date.getDate(), // 日
            "H+": date.getHours(), // 小时
            "m+": date.getMinutes(), // 分
            "s+": date.getSeconds(), // 秒
            "q+": Math.floor((date.getMonth() + 3) / 3) // 季度
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

    /**
     * 日期加减
     * @param date      日期
     * @param expr      y、m、d、w、h、n、s、l
     * @param value     数值
     * @returns Date
     */
    function add(date, expr, value) {
        $app.assert.isTrue(!$app.valid.isDate(date), "日期格式错误！");
        $app.assert.isTrue(!/y|M|d|w|H|m|s|ms/.test(expr), "表达式格式错误、可选范围(y、M、d、w、H、m、s、ms)！");
        $app.assert.isTrue(!$app.valid.isNumber(value), "数值式格式错误、必须为数字！");
        date = parse(date);
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
            case "H":
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
            day = parseInt(format("dd", max)) - parseInt(format("dd", min)) + 1; // 可能为负数
        if (day < 0) {
            month -= 1;
            max = add(max, "M", -1);
            day = parseInt(format("md", min)) - parseInt(format("dd", min)) + 1 + parseInt(format("dd", max))
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
        result.totalDay = result.max.getTime() - result.min.getTime();
        return result;
    }

    /**
     * 获取两个日期之间的间隔、文本描述
     * @param start
     * @param end
     * @param format   y年m个月d天
     */
    function spacingText(start, end, format) {
        if (!$app.valid.isDate(start) || !$app.valid.isDate(end)) {
            return "0天";
        } else {
            // $app.assert.isTrue(!$app.valid.isDate(start), "开始日期格式错误!");
            // $app.assert.isTrue(!$app.valid.isDate(end), "结束日期格式错位!");
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
    }

    /**
     * 获取两个日期之间的时间周期
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

    /**
     * 毫秒转文本
     * @param duration
     * @returns {string}
     */
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

    /**
     * 获取两个日期之间的天数
     * @param start
     * @param end
     */
    function spacingDay(start, end) {
        if ($app.valid.isDate(start) && $app.valid.isDate(end)) {
            var min = parse(start),
                max = parse(end);
            if (min.getTime() > max.getTime()) {
                min = parse(end);
                max = parse(start);
            }
            return ((max.getTime() - min.getTime()) / 86400 / 1000) + 1;
        }
        return 0
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
        // 获取两个日期之间的天数
        spacingDay: spacingDay,
        // 毫秒转文本
        msToText: msToText
    }

}