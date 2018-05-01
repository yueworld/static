module.exports = function ($app) {
    (function () {
        var e = $app.$.fn.select2.amd;
        return e.define("select2/i18n/zh-CN", [], function () {
            return {
                errorLoading: function () {
                    return "没有结果"
                }, inputTooLong: function (e) {
                    var t = e.input.length - e.maximum, n = "请删除" + t + "个字符";
                    return n
                }, inputTooShort: function (e) {
                    var t = e.minimum - e.input.length, n = "请再输入至少" + t + "个字符";
                    return n
                }, loadingMore: function () {
                    return "加载更多…"
                }, maximumSelected: function (e) {
                    var t = "只能选择" + e.maximum + "个项目";
                    return t
                }, noResults: function () {
                    return "未找到结果"
                }, searching: function () {
                    return "搜索中…"
                }
            }
        }), {define: e.define, require: e.require}
    })();
    $app.$.fn.select2.defaults.set('language', 'zh-CN');
    $app.directive("select2", ["$timeout", function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                ngModel: '=',
                select2: "="
            },
            link: function ($scope, element, $attr) {
                var $element = $app.$(element);
                $scope.$watch("ngModel", function (newVal, oldVal) {
                    $timeout(function () {
                        $element.find('[value^="?"]').remove();
                        if (angular.isString(newVal)) {
                            $element.val((newVal || "").split(","));
                        } else {
                            $element.val(newVal);
                        }
                        $element.trigger('change');
                    });
                });
                $scope.$watch("select2", function () {
                    var instance = $element.empty().select2(angular.extend({
                        language: 'zh-CN',
                        placeholder: '-- 请选择 --'
                    }, $scope.select2)).data("select2");

                    function select(event) {
                        $timeout(function () {
                            $scope.ngModel = instance.val();
                            if ($scope.select2.select) {
                                $timeout(function () {
                                    if ($scope.select2.multiple) {
                                        $scope.select2.select(instance.data());
                                    } else {
                                        $scope.select2.select(event.data);
                                    }
                                });
                            }
                        });
                    }
                    instance.on("select", function (event) {
                        select(event);
                    });
                    instance.on("unselecting", function (event) {
                        select(event);
                    });

                    if ($scope.ngModel) {
                        $element.val($scope.ngModel);
                    }/*
                     if ($element.find('[value^=' + $scope.ngModel + ']').length > 0) {
                     console.log(111111111)
                     }*/ else {
                        if (!$scope.select2.ajax) {
                            $scope.ngModel = undefined;
                        }
                        $element.val("-");
                    }
                    $element.trigger("change");
                }, true);
                $scope.$on("$destroy", function () {
                    if ($element.data("select2")) {
                        $element.data("select2").destroy();
                    }
                });
            }
        }
    }])
};