module.exports = function ($app, $state) {
    // 项目
    $state.state("basic.info.project", {
        url: "/project", "abstract": true,
        template: '<div class="col-xs-12 p0 bg-white animated-ui-view fadeIn fadeOut" ui-view></div>'
    });
    $state.state("basic.info.project.index", {
        url: "/index.html?areaId&operateStatusId&term&page",
        template: require("../views/project/project.index.html"),
        controller: require("../controller/project").index($app),
        resolve: {
            "$response": ["$rootScope", "$q", "ProjectService", function ($scope, $q, projectService) {
                return {projects:{projects:{}}}
            }]
        }
    })
}