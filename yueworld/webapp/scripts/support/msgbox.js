/**
 * msgbox.js
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
            template: require("../application/platform/views/msgbox.html"),
            controller: ["$scope", function ($scope) {
                var option = $scope.option;
                $scope.btnClass = function (btn) {
                    if (btn.class) {
                        return btn.class;
                    } else if (option.action == "error") {
                        return "ys-platform-btn-danger"
                    } else {
                        return "ys-platform-btn-default";
                    }
                }
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
     * $app.msgbox.confirm({message:"xxx"})
     *
     * @param option
     * @returns {*}
     */
    function confirm(option) {
        return message(angular.extend({
            // title:"操作提示",
            buttons: [
                {text: "取消", result: false, class: 'ys-platform-btn-default'},
                {text: "确定", result: true, class: 'ys-platform-btn-primary'}
            ]
        }, option, {action: "confirm"}));
    }


    /**
     * 消息窗
     * 实例： $app.msgbox.info({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function info(option) {
        return message(angular.extend({
            /*title: "消息提示"*/
        }, option, {action: "info"}));
    }

    /**
     * 警告窗
     * 实例： $app.msgbox.warning({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function warning(option) {
        return message(angular.extend({
            buttons: [
                {text: "取消", result: false}, {text: "确定", result: true}
            ]
        }, option, {action: "warning"}));
    }

    /**
     * 错误窗
     * 实例： $app.msgbox.error({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function error(option) {
        return message(angular.extend({
            buttons: [
                {text: "取消", result: true}
            ]
        }, option, {action: "error"}));
    }

    /**
     * 成功窗
     * 实例： $app.msgbox.success({message:"xxx"})
     * @param option
     * @returns {*}
     */
    function success(option) {
        return message(angular.extend({
            /*title: "完成提示"*/
        }, option, {action: "success"}));
    }

    $app.msgbox = {
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