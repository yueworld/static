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
        var result = {all/*原始*/: angular.copy(options), options: options, hash: {}, root: {}, selected: []};
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

    // 取所有父元素
    function parents(dictionary, id, expandeds) {
        var current = dictionary.hash[id],
            expandeds = expandeds ? expandeds : (current ? [] : [dictionary.root]);
        if (current) {
            expandeds.push(current);
            if (dictionary.hash[current.parentId]) {
                return parents(dictionary, current.parentId, expandeds);
            }
        }
        return expandeds;
    }

    // 初始数据字典
    function init(dictionary) {
        if ($app.config.path("/dictionary")) {
            angular.forEach($app.config.path("/dictionary").children, function (dictionary) {
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

    $app.dictionary = {
        build: build,
        parents: parents,
        path: path,
        init: init,
        // 区域
        AREA: build([
            {id: "1001", text: "测试区域"}
        ]),
        LAYOUTS: build([{id: -1, name: "全部业态"},
            {id: 1003, name: "中餐", parentId: -1},
            {id: 10031, name: "粤菜", parentId: 1003},
            {id: 10032, name: "茶餐厅", parentId: 1003},
            {id: 10033, name: "川菜", parentId: 1003},
            {id: 100331, name: "重庆小面", parentId: 10033}
        ], true),
        // 项目
        PROJECTS: build([
            {id: "1001", text: "测试项目", areaId: "1001"}
        ]),
        // 楼栋
        BUILDINGS: build([
            {id: "1001", text: "测试楼栋", projectId: "1001"}
        ]),
        // 楼层
        FLOORS: build([
            {id: "1001", text: "测试楼层-01", buildingId: "1001"},
            {id: "1002", text: "测试楼层-02", buildingId: "1001"}
        ]),
        // 空间
        SPACES: build([
            {id: "1001", text: "测试空间-01", floorId: "1001", projectId: "1001"},
            {id: "1002", text: "测试空间-02", floorId: "1001", projectId: "1001"}
        ])
    };
}