module.exports = function ($app) {
    /**
     * 数据字典 指令
     */
    $app.directive("ysFrameworkSelect", ["$timeout", function ($timeout) {
        return {
            restrict: "A", replace: true,
            scope: {
                ysFrameworkSelect: "="
            }, controller: ["$scope", "$element", "$attrs", "$parse", function ($scope, $element, $attrs) {
                var $el = $app.$($element), option = $scope.ysFrameworkSelect;
                $el.on("click", function () {
                    $app.dialog.select.simple(angular.extend({
                        title: option.title || "请选择", values: (option.input[option.property] || "").split(","),
                        items: angular.copy($app.dictionary[option.dictionary].options)
                    }, option)).then(function (result) {
                        if (result.execute) {
                            if (!option.multiple) {
                                angular.forEach(result.values, function (value) {
                                    option.input[option.property] = value.id;
                                    setText(value.text)
                                })
                            } else {
                                option.input[option.property] = $app.mapProperty(result.values, "id", ",");
                                setText($app.mapProperty(result.values, "text", ","));
                            }
                        }
                    })
                });
                // 设值
                function setText(value) {
                    if ($el.is("input")) {
                        $el.val(value);
                    } else {
                        // @todo 其他情况待实现
                        alert("待实现");
                    }
                };
                // 回显
                setText($app.mapProperty($app.dictionary[option.dictionary].options.filter(function (item) {
                    return (option.input[option.property] || "").split(",").some(function (id) {
                        return item.id == id;
                    })
                }), "name", ","));
            }]
        };
    }]);
}