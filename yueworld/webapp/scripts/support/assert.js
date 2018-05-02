module.exports = function ($app) {

    /**
     * 是否为真
     * @param success
     * @param message
     * @param code
     */
    function isTrue(success, message, code) {
        if (success) {
            var error = new Error(message);
            if (code) {
                error.code = code;
            }
            throw error;
        }
    }

    /**
     * 是否为空
     * @param value
     * @param message
     * @param code
     */
    function isEmpty(value, message, code) {
        isTrue($app.valid.isEmpty(value), message, code);
    }

    $app.assert = {
        // 是否为真，为真、则抛异常
        isTrue: isTrue,
        // 是否为空
        isEmpty: isEmpty
    }
}