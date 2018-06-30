module.exports = function ($app) {
    // ========================================== CacheHelper ==========================================================
    var $cache = sessionStorage || {};

    /**
     * 设置属性
     * @param key
     * @param value
     * @returns {*}
     */
    function setAttr(key, value) {
        $cache[key] = escape(angular.toJson(value));
        return value;
    }

    /**
     * 获取属性
     * @param key
     * @returns {*}
     */
    function getAttr(key) {
        return $cache[key] ? angular.fromJson(unescape($cache[key])) : undefined;
    }

    $app.session = {
        // 用户编号
        id: "",
        // 登录名
        username: "",
        // Tgc
        tgc: "",
        // 设置属性
        setAttr: setAttr,
        // 获取属性
        getAttr: getAttr
    }
}