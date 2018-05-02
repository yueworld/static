module.exports = function ($app) {

    // 数值处理
    // ========================================== NumberHelper ==========================================================

    /**
     * 将一个浮点数转成整数，用于后续计算
     * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
     * @param value {number} 小数
     * @return {object} {times:100, num: 314}
     */
    function toInt(value) {
        var ret = {times: 1, num: 0};
        var isNegative = value < 0;
        if ($app.valid.isInt(value)) {
            ret.num = value;
            return ret;
        }
        var strfi = value + '';
        var dotPos = strfi.indexOf('.');
        var len = strfi.substr(dotPos + 1).length;
        var times = Math.pow(10, len);
        var intNum = parseInt(Math.abs(value) * times + 0.5, 10);
        ret.times = times;
        if (isNegative) {
            intNum = -intNum;
        }
        ret.num = intNum;
        return ret
    }

    /*
      * 核心方法，实现加减乘除运算，确保不丢失精度
      * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
      *
      * @param a {number} 运算数1
      * @param b {number} 运算数2
      * @param precision {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
      * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
      *
      */
    function calc(v1, v2, precision, op) {
        var o1 = toInt(v1);
        var o2 = toInt(v2);
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
        var times = Math.pow(10, precision);
        var des = result * times + 0.5;
        des = parseInt(des, 10) / times;
        return des + ''
    };

    /**
     * 获取数字、小数位采用绝对值
     * @param value                     value、精度
     * @param precision
     * @returns {*}
     */
    function parse(value, precision) {
        if (!$app.valid.isNumber(value)) {
            return 0;
        } else {
            return parseFloat(value).toFixed(precision | 0);
        }
    }

    $app.number = {
        // 转为数字、小数位采用绝对值
        parse: parse,
        // 加法
        add: function (v1, v2, precision /* 精度 */) {

            return calc(v1, v2, precision | 0, "add");
        },
        // 剑法
        subtract: function (n1, n2, precision /* 精度 */) {
            return calc(n1, n2, precision | 0, "subtract");
        },
        // 乘法
        multiply: function (n1, n2, precision /* 精度 */) {
            return calc(n1, n2, precision | 0, "multiply");
        },
        // 除法
        divide: function (n1, n2, precision /* 精度 */) {
            return calc(n1, n2, precision | 0, "divide");
        }
    }
}