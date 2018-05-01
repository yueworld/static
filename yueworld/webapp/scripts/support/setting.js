/**
 * setting.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2018-01-07 16:14:29
 * @description 远端配置
 */
module.exports = function ($app) {
    // ========================================== Setting Helper =======================================================

    var ids/*id映射*/ = {}, paths/*path映射*/ = {};

    function id(id) {
        // 根据 ID 获取 Setting
        return ids[id];
    }

    function path(path) {
        // 根据 PATH 获取 Setting
        return paths[path];
    }

    function text(path) {
        // 根据 PATH 获取 Setting
        var value = paths[path];
        return value ? value.value : "";
    }

    function init(settings) {
        // ID 映射
        angular.forEach(settings, function (setting) {
            if (setting.name) {
                setting.name = $app.decodeUnicode(setting.name);
            }
            ids[setting.id] = setting;
        });
        // PATH 映射
        angular.forEach(settings, function (child) {
            if (child.id != "-1") {
                var parent = ids[child.parentId];
                if (parent) {
                    (parent.children ? parent.children : (parent.children = [])).push(child);
                    if (parent.type == "struct") {
                        parent[child.property] = child.type == "struct" || child.type == "list" ? child : child.value;
                    }
                }
            }
            if (child.path) {
                paths[child.path] = child;
            }
        })
    }

    $app.setting = {id: id, path: path, text: text, init: init};

    // 实例
    // $app.settings.path("/")
}