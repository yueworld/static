module.exports = function ($app) {
    // Url 处理
    // ========================================== UrlHelper ========================================================

    /**
     * 读取URL参数
     * @param field
     * @returns {*}
     */
    function getParams(field) {
        var params = {};
        var queryString = window.location.search.substring(1);
        if (!queryString) {
            return "";
        } else {
            angular.forEach(queryString.split("&"), function (value) {
                var values = value.split("=");
                if (values.length > 1) {
                    params[values[0]] = values[1];
                }
            });
            return field ? params[field] : params;
        }
    }

    /**
     * 是否跨域
     * @param url
     * @returns {boolean}
     */
    function isCrossDomain(url) {
        return (url.indexOf("http") != -1 && url.indexOf(location.host) == -1) ? true : false;
    }

    /**
     * 设置动态URL根
     * @param url
     */
    function setDynamicUrl(url) {
        if (url.indexOf("http://") == -1) {
            $app.setup.dynamicUrl = "http://" + location.host + url;
        } else {
            $app.setup.dynamicUrl = url;
        }
    }

    /**
     * 获取动态URL根
     * @param url
     * @returns {*}
     */
    function getDynamicUrl(url) {
        if (!url) {
            return $app.setup.dynamicUrl
        } else if (url.indexOf("http://") != -1) {
            return url;
        } else {
            return $app.setup.dynamicUrl + url;
        }
    }

    // 设置静态URL
    function setStaticUrl(url) {
        if (url.indexOf("http://") == -1) {
            $app.setup.staticUrl = "http://" + location.host + url;
        } else {
            $app.setup.staticUrl = url;
        }
    }

    // 动态URL根
    function getStaticUrl(url) {
        if (!url) {
            return $app.setup.staticUrl
        } else if (url.indexOf("http://") != -1) {
            return url;
        } else {
            return $app.setup.staticUrl + url;
        }
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
        return decodeURI(value.replace(/\\/g, "%"));
    }

    $app.url = {
        // 读取URL参数
        getParams: getParams,
        // 是否跨域
        isCrossDomain: isCrossDomain,
        // 设置动态URL根
        setDynamicUrl: setDynamicUrl,
        // 获取动态URL根
        getDynamicUrl: getDynamicUrl,
        // 设置静态URL
        setStaticUrl: setStaticUrl,
        // 获取静态URL根
        getStaticUrl: getStaticUrl,
        // URL 编码
        encoder: encoder,
        // URL 解码
        decoder: decoder
    };

}