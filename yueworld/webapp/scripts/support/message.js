/**
 * dialog.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-06-012 21:31:38
 * @description 弹出框
 */
module.exports = function ($app) {

    // 消息窗
    function message($option) {
        return $app.modal(angular.extend({
            title: false, message: false, width: 480, buttons: [{text: "知道啦", result: true}],
            template: "<div class='col-xs-12 p0 ys-framework-dialog-msg'>" +
            "   <div class=\"col-xs-12 p0 header\" ng-if=\"option.title\" ng-bind=\"option.title\"></div>\n" +
            "        <div class=\"col-xs-12 p0 body\" ng-bind-html=\"option.message\"\n" +
            "        ng-class=\"{'error':'alert-danger','confirm':'alert-warning','warning':'alert-warning','info':'alert-info','success':'alert-success'}[option.action]\"></div>\n" +
            "        <div class=\"col-xs-12 footer p0\" ng-if=\"option.buttons.length==2\">\n" +
            "            <div class=\"col-xs-6\" ng-repeat=\"bt in option.buttons\" ng-bind=\"bt.text\"\n" +
            "                 ng-click=\"submit(bt.result)\"></div>\n" +
            "        </div>\n" +
            "        <div class=\"col-xs-12 footer p0\" ng-if=\"option.buttons.length==1\">\n" +
            "            <div class=\"col-xs-12\" ng-bind=\"option.buttons[0].text\"\n" +
            "                 ng-click=\"submit(option.buttons[0].result)\"></div>\n" +
            "        </div>\n" +
            "    </div>" +
            "</div>",
            controller: ["$scope", function ($scope) {
                var option = $scope.option;
                $scope.submit = function (execute) {
                    $scope.close(function () {
                        option.deferred.resolve({execute: execute});
                    })
                }
            }]
        }, $option));
    }

    /**
     * 确认窗
     * $app.message.confirm({message:"xxx"})
     *
     * @param option
     * @returns {*}
     */
    function confirm(option) {
        return message(angular.extend({
            buttons: [{text: "取消", result: false}, {
                text: "确定",
                result: true
            }]
        }, option, {action: "confirm"}));
    }


    /**
     * 消息窗
     * 实例： $app.message.info({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function info(option) {
        return message(angular.extend({/*title: "消息提示"*/}, option, {action: "info"}));
    }

    /**
     * 警告窗
     * 实例： $app.message.warning({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function warning(option) {
        return message(angular.extend({
            buttons: [{text: "取消", result: false}, {
                text: "确定",
                result: true
            }]
        }, option, {action: "warning"}));
    }

    /**
     * 错误窗
     * 实例： $app.message.error({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function error(option) {
        return message(angular.extend({/*title: "错误提示"*/}, option, {action: "error"}));
    }

    /**
     * 成功窗
     * 实例： $app.message.success({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function success(option) {
        return message(angular.extend({/*title: "完成提示"*/}, option, {action: "success"}));
    }

    $app.message = {
        // 确认窗
        confirm: confirm,
        // 消息窗
        info: info,
        // 警告窗
        warning: warning,
        // 错误窗
        error: error,
        // 成功窗
        success: success
    };
}