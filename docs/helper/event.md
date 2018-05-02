# 事件
全局事件订阅、发布
* namespace：` $app.event `

## subscribe
* 参数：`eventName`, `callback`

发布名称为 `eventName` 的事件、 `callback` 为事件产生后的执行逻辑
```js
// 示例
$app.event.publish("__login__",function(event,data) {
    // 订阅到 登录参数
})
```

## publish
* 参数：`eventName`, `data`, `deferred`

发布名称为 `eventName` 、参数为 `data` 的事件,需要监听事件执行情况可以传递 promise 对象进行回传通知。 

```js
// 示例
$app.event.publish("__login__",{user:{username:"admin",realname:"超级管理员"}});
```