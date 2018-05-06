/**
 * dictionary.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2018-01-07 16:14:29
 * @description 数据字典/动态配置
 */
module.exports = function ($app) {
    // ========================================== Dictionary Helper ====================================================
    // 构建递归路径
    function path(hash, item) {
        var name = item.text || item.name;
        if (hash[item.parentId]) {
            return path(hash, hash[item.parentId]) + " > " + name;
        } else {
            return name;
        }
    }

    // 将数组换换位 {has:{},options,root:{},tree:{}} 形式、方便控件初始化 查值
    function build(options, isBuildTree, filter) {
        var result = {all/*原始*/: [], options: options, hash: {}, root: {}, selected: []};
        angular.forEach(result.options, function (option) {
            result.hash[option.id] = option;
            if (option.id == "-1") {
                result.root = option;
            }
            if (!option.text) {
                if (option.name) {
                    option.text = option.name;
                } else if (option.title) {
                    option.text = option.title;
                } else {
                    option.text = "未知(name、title不存在)"
                }
            }
        })
        // 构建树
        if (isBuildTree) {
            angular.forEach(result.options, function (option) {
                if (option.parentId && (!filter || filter(option))) {
                    var parent = result.hash[option.parentId];
                    if (parent) {
                        var children = parent.children;
                        if (!children) {
                            children = parent.children = [];
                        }
                        children.push(option)
                    }
                }
                if (!option.path) {
                    option.path = path(result.hash, option);
                }
            })
        }
        return result;
    }

    // 初始数据字典
    function init(dictionary) {
        if ($app.setting.path("/dictionary")) {
            angular.forEach($app.setting.path("/dictionary").children, function (dictionary) {
                var options = [];
                angular.forEach(dictionary.children, function (option) {
                    options.push({text: option.name, id: option.property, name: option.name});
                })
                $app.dictionary[dictionary.property] = build(options)
            })
        }
        angular.forEach(dictionary, function (values, key) {
            $app.dictionary[key] = build(values, true);
        })
    }

    $app.dictionary = {path: path, build: build, init: init};
}