module.exports = function ($app) {
    // 校验
    // ========================================== ValidHelper ==========================================================

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
            var tmp = $app.data.trim(value);
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
            return $app.data.trim(source).toUpperCase() == $app.data.trim(target).toUpperCase();
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
    var intRegex = /^\d+(\.\d+)?$/, // 整数
        floatRegex = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;// 浮点数
    function isNumber(value) {
        if (null != value && value != undefined) {
            value = $app.data.trim(value);
        }
        return intRegex.test(value) || floatRegex.test(value)
    }

    $app.valid = {
        // 是否为空
        isEmpty: isEmpty,
        // 同上取反
        isNotEmpty: isNotEmpty,
        // 是否数字
        isNumber: isNumber,
        // 比较是否相等
        eq: equals,
        // 是否整数
        isInt: isInt,
        // 开始是否相同
        startsWith: startsWith,
        // 结尾是否相同
        endsWith: endsWith
    }
}