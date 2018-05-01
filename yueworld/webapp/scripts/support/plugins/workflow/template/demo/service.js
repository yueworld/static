// 服务注册
$app.service("ProjectService", ["$q", function ($q) {
    return {
        quick: function () {
            var projects = [{text: "七宝宝龙", id: 1}, {text: "奉贤宝龙", id: 2}]
            return $q.when(projects);
        }
    }
}])