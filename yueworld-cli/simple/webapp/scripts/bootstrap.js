/**
 * bootstrap.js
 * @author zhanggj
 * @version 1.0.0
 * @time 2017-03-02 10:32:11
 * @description Bootstrap App
 */
// 初始化
window.$app = require("yueworld");
$app.bootstrap({
    // 找不到任何路由、最后的选择
    otherwise: "/basic/info/project/index.html",
    loading: true,
}, [/* 基础数据 */require("./application/basic/import")]);