module.exports = function ($app) {
    // ========================================== CacheHelper ==========================================================
    var $cache = {};

    /**
     * 设置缓存
     * @param id
     * @param value
     * @returns {*}
     */
    function setCache(id, value) {
        $cache[id] = value;
        return value;
    }

    /**
     * 获取缓存
     * @param id
     * @returns {*}
     */
    function getCache(id) {
        return $cache[id];
    }

    $app.cache = {
        set: setCache, get: getCache
    }

}