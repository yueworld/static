# 常用组件

下拉框、编辑控制、错误提示、图标、上传


## ys-platform-dropdown-static

静态数据字典
```js
// 参数说明
var params={
    // 待操作的模型
    model: {},
    // 值字段名、唯一编号
    idField: "id",
    // 显示文本字段名
    textField: "text",
    // 选中item后、针对model的赋值关系
    set: {
        /* key 为 选中 对象的属性、value 为要设置给 model 的属性、示例：    id:"projectId"、id:"companyId" */
        /* selectedItem.property: model.property */
        id: "id"
    },
    // 开启查询
    dictionary: [],
    // 默认宽度
    width: "100%",
    // 选中回调事件、参数：select(selectedItem、model)
    select: angular.noop,
    theme: "default" /* default、caret */
};
```
```html
<!-- 完整示例 -->
<div ys-platform-dropdown-static="{model:{},dictionary:[{text:'上海七宝万科',id:1024}]}"/>
```


## ys-platform-dropdown-dynamic

动态数据字典
```js
// 参数说明
var params={
   // 待操作的模型
    model: {},
    // 值字段名、唯一编号
    idField: "id",
    // 显示文本字段名
    textField: "text",
    // 选中item后、针对model的赋值关系
    set: {
       /* key 为 选中 对象的属性、value 为要设置给 model 的属性、示例：    id:"projectId"、id:"companyId" */
       /* selectedItem.property: model.property */
       id: "id"
    },
    // 级联刷新
    watchReload: {/* model: {}, property: ""*/},
    // 默认查询条件
    filter: {term: "" /*快速查询关键字*/, size: 6 /* 显示条数 */, autoSearch: true/*自动查询*/},
    // 开启查询
    search: false,
    // 默认宽度
    width: "100%",
    // 异步查询实现、可以是 Service 名称 例如 ProjectService -> project 、 StoreService -> store
    handler: function (filter, option) {
       var deferred = $app.injector.get("$q").defer();
       deferred.resolve([]);
       return deferred.promise;
    },
    // 选中回调事件、参数：select(selectedItem、model)
    select: angular.noop,
    theme: "default" /* default、caret */
};
```
```html
<!-- 完整示例 -->
<div ys-platform-dropdown-static="{model:{},handler:quickSearch}"/>
```