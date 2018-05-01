//=========================================================================
//============================= 2017-7-02 ============================
//=========================================================================
module.exports = function ($app) {
    $app.factory("HelperService", ["RequestService", function (requestService) {
        // 异步辅助逻辑
        return {
            getLastDayOfCycleId: function (cycleId, date) {
                // 获取指定周期内最后一天 cycleId 1001:月、1002:季、1003:年
                return requestService.post("sdk/platform/helper", {params: {action: 2001, cycleId: cycleId, date: date}});
            }
        }
    }]);
}
