//=========================================================================
//============================= NEW 2016-01-29 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("UserService", ["RequestService", function (requestService) {
        return {
            quick: function (params) {
                return requestService.get("sdk/platform/user", {params: angular.extend({action: 1004}, params)});
            }, check: function (params) {
                return requestService.get("sdk/platform/user", {params: angular.extend({action: 2001}, params)});
            }, logout: function () {
                return requestService.get("sdk/platform/user", {params: angular.extend({action: 2002}, {_slk_: true})});
            }
        }
    }]);

    $app.user = {
        head: "styles/img/user/head_default.png", login: false, init: false, realname: "未知用户",
        // 退出
        logout: function () {
            $app.injector.invoke(["UserService", "$timeout", function (userService, $timeout) {
                $app.dialog.confirm({message: "确定要退出系统吗？", width: 400}).then(function (result) {
                    if (result.execute) {
                        userService.logout().then(function ($response) {
                            if ($response.data.success) {
                                $app.user.login = false;
                                $timeout(function () {
                                    window.location.href = $response.data.data.login.split("_srk_")[0] + "_srk_=" + encodeURIComponent(window.location.href);
                                }, 150)
                            } else {
                                $app.tip.error({message: "登陆失败"});
                            }
                        })
                    }
                })
            }])
        }
    }
};