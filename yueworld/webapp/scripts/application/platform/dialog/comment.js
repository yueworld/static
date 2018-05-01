module.exports = function ($app) {
    require("./comment.css")
    // Dialog
    $app.dialog.comment = {
        // 用户选择、使用示例
        // $app.dialog.comment.publish({}).then(function (result) {
        // })
        publish: function (option) {
            option = angular.extend({
                title: "添加留言",
                // category:"INVITATION_PLAN_YX",
                values: [], single: true, width: 680,
                template: require("../views/comment.html"),
                controller: ["$scope", "$timeout", "$element", "CommentService", function ($scope, $timeout, $element, commentService) {
                    var option = $scope.option, input = $scope.input = {};
                    $app.subscribe("/comment/publish", function (event, data) {
                        option = $scope.option = angular.extend({title: "添加留言"}, data);
                        if (!option.category) {
                            $app.tip.error({message: option.title + "失败、未提供留言类型参数！"})
                        } else if (!option.targetId) {
                            $app.tip.error({message: option.title + "失败、未提供留言目标ID参数！"})
                        } else {
                            input = $scope.input = {targetId: option.targetId};
                            if (option.category != 'INVITATION_PLAN_YX') {
                                input.category = option.category;
                            }
                            $timeout(function () {
                                var $container = $el.next().find("div.container").addClass("fadeInDown ng-enter-active")
                                $container.css({"top": "calc((100vh - " + $container.height() + "px)/2)"})
                            }, 150)
                        }
                    });
                    $scope.submit = function (execute) {
                        try {
                            if (option.category == 'INVITATION_PLAN_YX') {
                                $app.assert(!input.createdDate, "未选择日期", 9001);
                                $app.assert(!input.category, "未选择沟通方式", 9002);
                                $app.assert(!input.contactPerson, "未填写联系人", 9003);
                                $app.assert(!input.tel, "未填写联系电话", 9004);
                            }
                            $app.loading(true);
                            input.errorCode = 0;
                            commentService.publish(angular.toJson(input)).then(function ($response) {
                                if ($response.data.success) {
                                    $app.tip.success({message: "操作完成"});
                                    $scope.close($response);
                                } else {
                                    input.errorCode = $response.data.code;
                                    $app.tip.error({message: $response.data.message});
                                }
                            }).finally(function () {
                                $app.loading(false);
                            })
                        } catch (ex) {
                            input.errorCode = ex.code;
                            $app.tip.error({message: ex.message});
                        }
                    }
                }]
            }, option);
            return $app.dialog.modal(option);
        }
    }
}