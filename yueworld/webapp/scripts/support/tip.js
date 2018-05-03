module.exports = function ($app) {
    var $container, $timer;

    /**
     * 消息提示
     * @param option
     */
    function tip(option) {
        if (!$container) {
            $container = $app.$('<div class="ys-framework-tips"><div class="message-item-list"></div></div>').appendTo("body").find("div.message-item-list");
        }
        return $app.injector.invoke(["$q", "$animate", "$timeout", function ($q, $animate, $timeout) {
            var $message = $app.$('<div class="message-item-item">' + option.message + '</div>').appendTo($container),
                deferred = $q.defer(), $timer;
            if (option.action == "error") {
                $message.addClass("alert-danger");
            } else if (option.action == "success") {
                $message.addClass("alert-success");
            } else if (option.action == "warning") {
                $message.addClass("alert-warning");
            } else if (option.action == "info") {
                $message.addClass("alert-info");
            }
            $timeout(function () {
                $animate.addClass($message, "in");
            });
            $message.hover(function () {
                $timeout.cancel($timer);
            }, function () {
                $timer = $timeout(function () {
                    $animate.removeClass($message, "in").then(function () {
                        $message.remove();
                        deferred.resolve();
                    });
                }, 2800);
            });
            $message.trigger("mouseleave");
            return deferred.promise;
        }]);
    }

    /**
     * 消息提示
     * @param option
     */
    function info(option) {
        tip(angular.extend({action: "info"}, option))
    }

    /**
     * 警告提示
     * @param option
     */
    function warning(option) {
        tip(angular.extend({action: "warning"}, option))
    }

    /**
     * 错误提示
     * @param option
     */
    function error(option) {
        tip(angular.extend({action: "error"}, option))
    }

    /**
     * 成功提示
     * @param option
     */
    function success(option) {
        tip(angular.extend({action: "success"}, option))
    }

    $app.tip = {
        // 消息提示
        info: info,
        // 警告提示
        warning: warning,
        // 错误提示
        error: error,
        // 成功提示
        success: success
    }

}