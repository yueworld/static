# 配置项

请放置在 `$app.bootstrap({})` 里。

## title

* 类型：`String`
* 默认值：`请稍候、系统正在努力加载中。`

浏览器标题

```js
$app.bootstrap = {
    title: '上海悦商科技信息有限公司'
};
```

## loading

* 类型：`Boolean`
* 默认值：`false`

页面载入动效
 
```js
// 预先配置
$app.bootstrap = {
    // 隐藏
    loading: false,
    // 显示
    loading: true
};
// 代码里动态控制
// 隐藏
$app.loading(false);
// 显示
$app.loading(false);
```

> 有页面闪烁的问题？请在页面植入以代码提前生成html元素。  
同时可以自定义提示语

```html
<div class="ys-framework-loading in">
    <div class="pre">
        <div class="left-bar">
            <div class="left-bar-top-bar"></div><div class="left-bar-bottom-bar"></div>
        </div>
        <div class="loader-spinner">
            <div class="so"></div><div class="ul"></div><div class="te"></div><div class="ar"></div><div class="y"></div>
        </div>
        <div class="right-bar">
            <div class="right-bar-top-bar"></div><div class="right-bar-bottom-bar"></div>
        </div>
    </div>
    <div class="loader-text">请稍候、系统正在努力加载中。</div>
</div>
```


## session

* 类型：`Object`
* 默认值：`{太长写不下、见下文}`

会话信息，包含用户登录状态，和 统一配置、数据字典等信息

```js
$app.bootstrap( {
    session:{
        code: 200,
        message:'已登录！',
        data:{
            // 参见 辅助功能下 / 统一配置
            settings: [
                {path: "/ui/logo", value: "styles/img/logo/default.png"},
                {path: "/ui/title/full", value: "测试系统"}
            ],
            // 参见 辅助功能下 / 数据字典 
            dictionary: {
                AREA: [
                    {name: "北部区域", id: "1001"}, {name: "南部区域", id: "1002"}
                ],
                PROJECTS: [
                    {name: "上海宝龙城市广场", id: "1001"}, {name: "上海宝龙城市广场", id: "1001"}
                ]
            }
        }
    }
});
```


## ready

* 类型：`Function`
* 默认值：`angular.noop`
* 参数：`$app`

准备完成

```js
$app.bootstrap({
    ready: function($app) {
        // Do Something
    }
})
```
## requestTimeout

* 类型：`Function`
* 默认值：`{太长写不下、见下文}`
* 参数：`$app`

请求超时钩子

```js
$app.bootstrap({
    requestTimeout:function($app) {
        $app.loading(false);
        $app.msgbox.error({
            message: "很抱歉！<br/>由于您的网络原因、请求失败。",
            buttons: [{text: "我要重试", result: true}]
        }).then(function () {
            // 路由刷新
            $app.router.reload();
        })
    }
});
```

## responseError

* 类型：`Function`
* 默认值：`{太长写不下、见下文}`
* 参数：`$app`、`message`

响应异常钩子

```js
$app.bootstrap({
    // http 状态
    // response.status == -1 || response.status == 504 || response.status == 502
    // response.data.code == 500
    responseError: function ($app, response /* 错误内容 */) {
        $app.loading(false);
        $app.msgbox.error({
            message: "很抱歉！<br/>由于服务器内部错误、请求失败。",
            buttons: [{text: "我要重试", result: true}]
        }).then(function () {
            // 整体页面刷新
            window.location.reload();
        })
    }
});
```


## needLogin

* 类型：`Function`
* 默认值：`{太长写不下、见下文}`
* 参数：`$app`

未登录或会话超时钩子

```js
$app.bootstrap({
    // response.data.code == -100
    needLogin: function ($app, response) {
        $app.loading(false);
        $app.msgbox.error({
            message: "很抱歉！<br/>" + ($app.user.login ? "会话超时、请重新登陆！" : "您尚未登陆、请先去登陆！"),
            buttons: [{text: "去登陆", result: true}]
        }).then(function () {
            window.location.href = response.data.login.split("_srk_")[0] + "_srk_=" + encodeURIComponent(window.location.href);
        })
    }
});
```

## 登录示例
[](./configuration.simple.html ':include :type=iframe width=100% height=300px')
[RunJs](http://runjs.cn/code/giv2wqyz ':target=_blank')