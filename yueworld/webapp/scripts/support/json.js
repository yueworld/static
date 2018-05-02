module.exports = function ($app) {
    // Json处理
    // ========================================== JsonHelper ==========================================================

    /**
     * 转换为Json字符串
     */
    function toJson(value) {
        return angular.toJson(value);
    }

    /**
     * 转为为Json对象
     * @param json
     * @returns {Object|Array|string|number}
     */
    function toObject(json) {
        return angular.fromJson(json);
    }

    /**
     * Json To Url 序列化
     * @param value
     * @returns {string}
     */
    function serialize(value) {
        var t = "", r, i, s, o, u, a, f;
        for (r in value) {
            i = value[r];
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

    $app.json = {
        // 转换为Json字符串
        toJson: toJson,
        // 转为为Json对象
        toObject: toObject,
        // Json To Url 序列化
        serialize: serialize
    }
}

