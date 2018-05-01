module.exports = function ($app) {
    $app.directive("tinymce", ["$timeout", function ($timeout) {
        return {
            restrict: "A",
            scope: {
                ngModel: '=', save: "&"
            },
            controller: ["$scope", "$element", function ($scope, $element) {
                tinymce.init({
                    menubar: false,
                    skin: false,
                    height: "400",
                    target: $element[0],
                    theme: "modern",
                    plugins: ["table fullscreen contextmenu code preview print"],
                    toolbar: 'formatselect | bold italic strikethrough forecolor backcolor | link | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat | code  preview print | fullscreen | save',
                    content_css: [$app.getDynamicUrl("scripts/support/plugins/tinymce/css/content.min.css")],
                    branding: false,
                    plugin_preview_width: 1024,
                    plugin_preview_height: 600,
                    extended_valid_elements: "span[name|style|class|input-edit]",
                    contextmenu: "var | inserttable | border cell row column deletetable",
                    object_resizing: "span.input-comm,table,img,div",
                    // valid_elements:['span[input-edit|name]'],
                    init_instance_callback: function (editor) {
                        editor.on('KeyUp nodechange setContent', function (e) {
                            $timeout(function () {
                                $scope.ngModel = editor.getContent();
                            });
                        });
                        editor.setContent($scope.ngModel ? $scope.ngModel : "");
                    }, setup: function (editor) {
                        require("../../../support/plugins/tinymce/plugins/var/plugin")(editor);
                        require("../../../support/plugins/tinymce/plugins/border/plugin")(editor, $app);
                        editor.addButton("save", {
                            text: "保存",
                            icon: "save", onclick: function () {
                                if ($scope.save()) {
                                    $timeout($scope.save());
                                }
                            }
                        })
                    }
                });
            }]
        };
    }]);
}