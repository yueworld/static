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
    
    /**
     * URL 编码
     * @param value
     * @returns {string}
     */
    function encoder(value) {
        return encodeURI(value);
    }

    /**
     * URL 解码
     * @param value
     * @returns {*}
     */
    function decoder(value) {
        value = value.replace(/\\/g, "%");
        return unescape(value);
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


    $app.data = {
        // 剔除空格
        trim: trim,
        // 首字母大写
        firstUpperCase: firstUpperCase,
        // 编译格式化字符串、
        template: template,
        // URL 编码
        decoder: decoder,
        // URL 解码
        encoder: encoder,
        // 返回随机内容
        random: random,
        // 连接数组内某一属性的字符串
        joinProperty: joinProperty
    }

}

