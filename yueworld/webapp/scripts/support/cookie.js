module.exports = function ($app) {
    // Cookie 处理
    // ========================================== CookieHelper ========================================================
    /**
     * 读值
     * @param name
     * @param defaultValue
     * @returns {*}
     */
    function getCookie(name, defaultValue) {
        if (!name) return;
        var values = document.cookie.split(";"), value;
        for (var index = 0; index < values.length; index++) {
            var i = values[index].split("=");
            i[0].trim() == name && (value = unescape(i[1]))
        }
        return (!value || value.lenght == 0 && defaultValue) ? defaultValue : value
    }

    /**
     * 设值
     * @param value {name:property,value:value,domain:'',path:'/',day:30}
     */
    function setCookie(value) {
        if (!value.name) return;
        var exp = new Date();
        exp.setTime(exp.getTime() + (value.day ? value.day : 30) * 24 * 60 * 60 * 1000);
        document.cookie = value.name + "=" + escape(value.value) + (value.domain ? ";domain=" + value.domain : "") + "; path=" + (value.path ? value.path : "/") + ";expires=" + exp.toGMTString();
    }

    /**
     * 比较
     * @param key
     * @param target
     */
    function equals(key, target) {
        return $app.valid.eq(this.get(key), target);
    }

    $app.cookie = {
        // 获取 cookie
        get: getCookie,
        // 设值
        set: setCookie,
        eq: equals
    };
}

