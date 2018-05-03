module.exports = function ($app) {
    // 校验
    // ========================================== ValidHelper ==========================================================
    var regex = {
        // 日期
        date: [
            /^\d{8}$/,                                   // 20180502                     年月日
            /^\d{10}$/,                                  // 1525271112                   秒值
            /^\d{12}$/,                                  // 201805021232                 年月日时分秒
            /^\d{13}$/,                                  // 1525271088641                毫秒值
            /^\d{4}-\d{1,2}-\d{1,2}$/,                     // 2008-05-02                   年-月-日
            /^\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}$/,       // 2008-05-02 02:12             年-月-日
            /^\d{4}年\d{1,2}月\d{1,2}日$/,                  // 2008-05-02                   年-月-日
            /^\d{4}年\d{1,2}月\d{1,2}日\s\d{1,2}时\d{1,2}分$/   // 2008年05月02日 02时12分       年-月-日
        ],
        // 手机
        mobile: /^1\d{10}$/,
        // 数值
        number: {
            int: /^\d+(\.\d+)?$/, // 整数
            float: /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/// 浮点数
        },
        // 邮箱地址
        email: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.[a-z]+([-.][a-z]+)*$/
    }, toString = Object.prototype.toString;

    /**
     * 是否为空
     * @param value
     * @param nullValue
     * @returns {boolean}
     */
    function isEmpty(value, nullValue) {
        if (null == value || undefined == value || 0 == value) {
            return true;
        } else if (value instanceof String) {
            var tmp = $app.helper.trim(value);
            if (tmp == "") {
                return true;
            } else {
                return $app.valid.eq(value, nullValue);
            }
        } else if (value instanceof Array) {
            return value.length == 0;
        }
        return false;
    }

    /**
     * 同上取反
     * @param value
     * @param nullValue
     * @returns {boolean}
     */
    function isNotEmpty(value, nullValue) {
        return !isEmpty(value, nullValue);
    }

    /**
     * 是否相等
     * @param source
     * @param target
     * @returns {boolean}
     */
    function equals(source, target) {
        if (!source || !target) {
            return false;
        } else {
            return $app.helper.trim(source).toUpperCase() == $app.helper.trim(target).toUpperCase();
        }
    }

    /**
     * 是否整数
     * @param value
     * @returns {boolean}
     */
    function isInt(value) {
        return Math.floor(value) === value;
    }

    // ========================================== String Helper ========================================================
    /**
     * 开始是否相同
     * @param source
     * @param target
     * @returns {boolean}
     */
    function startsWith(source, target) {
        if (target == null || target == "" || source.length == 0 || target.length > source.length) {
            return false;
        }
        return source.substr(0, target.length) == target;
    }

    /**
     * 结尾是否相同
     * @param source
     * @param target
     * @returns {boolean}
     */
    function endsWith(source, target) {
        if (target == null || target == "" || source.length == 0 || target.length > source.length)
            return false;
        return source.substring(source.length - target.length) == target;
    }

    /**
     * 是否数字
     * @param value
     */

    function isNumber(value) {
        if (null == value || undefined == value || Infinity == value) {
            return false;
        }
        value = $app.helper.trim(value);
        return regex.number.int.test(value) || regex.number.float.test(value)
    }

    /**
     * 是否日期
     * @param value
     */


    function isDate(value) {
        if (isEmpty(value)) {
            return false;
        } else if (toString.call(value) === '[object Date]') {
            return true;
        }
        for (var i = 0; i < regex.date.length; i++) {
            if (regex.date[i].test(value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否手机号
     * @param value
     */
    function isMobile(value) {
        if (isEmpty(value)) {
            return false;
        }
        return regex.mobile.test(value);
    }

    /**
     * 是否邮箱地址
     * @param value
     * @returns {boolean}
     */
    function isEmail(value) {
        if (isEmpty(value)) {
            return false;
        }

        return regex.email.test(value);
    }

    /**
     * 文本长度是否在区间内
     * @param value
     * @param min
     * @param max
     */
    function isTextLength(text, min, max) {
        text = $app.helper.trim(text);
        if (isEmpty(text)) {
            return false;
        }
        return text.length <= max && text.length >= min;
    }

    /**
     * 判断数字 是否在区间内
     * @param number
     * @param min
     * @param end
     * @returns {boolean}
     */
    function isNumberBetween(number, min, end) {
        return number >= min && number <= end;
    }

    $app.valid = {
        // 是否为空
        isEmpty: isEmpty,
        // 同上取反
        isNotEmpty: isNotEmpty,
        // 是否数字
        isNumber: isNumber,
        // 是否日期
        isDate: isDate,
        // 是否手机号
        isMobile: isMobile,
        // 比较是否相等
        eq: equals,
        // 是否整数
        isInt: isInt,
        // 文本长度是否在区间内
        isTextLength: isTextLength,
        // 数字是否在区间内
        isNumberBetween: isNumberBetween,
        // 开始是否相同
        startsWith: startsWith,
        // 结尾是否相同
        endsWith: endsWith
    }
}