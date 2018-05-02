# 配置项

你可以配置在 `window.$app` 里。

```html
<script type="text/javascript">
    window.$app = {
        title:"上海悦商科技信息有限公司",
        loading:true
    }
</script>
```

## title

* 类型：`String`
* 默认值：`请稍候、系统正在努力加载中。`

设置标题。

```js
window.$app = {
    title: '上海悦商科技信息有限公司'
};
```

## loading

* 类型：`Boolean`
* 默认值：`false`

* 方法一

 简洁
```js
window.$app = {
    // 隐藏
    loading: false,
    // 显示
    loading: true
};
```

* 方法二

 植入以下`html`片段到页面、可自定义提示信息。
```html
<div class="ys-framework-loading in">
    <div class="pre">
        <div class="left-bar">
            <div class="left-bar-top-bar"></div>
            <div class="left-bar-bottom-bar"></div>
        </div>
        <div class="loader-spinner">
            <div class="so"></div><div class="ul"></div>
            <div class="te"></div><div class="ar"></div><div class="y"></div>
        </div>
        <div class="right-bar">
            <div class="right-bar-top-bar"></div>
            <div class="right-bar-bottom-bar"></div>
        </div>
    </div>
    <div class="loader-text">请稍候、系统正在努力加载中。</div>
</div>
```

>:动态控制、隐藏与显示

```js
// 隐藏
$app.loading(false);
// 显示
$app.loading(false);
```

## html5Mode

* 类型：`Boolean`
* 默认值：`false`

开启 Angular Js Router Html5 模式、优化 Url 效果。

```js
window.$app = {
    // 禁用 = http://xxx.xxx.com/#projet.html
    html5Mode: false,
    // 启用 = http://xxx.xxx.com/project.html
    html5Mode: true
};
```

## init

* 类型：`Function`
* 默认值：`angular.noop`
* 参数：`$app`

可以做一些 Angular Js 的初始工作！
```js
window.$app = {
  init: function($app) {
        // Angular Service 注册
        $app.service("UserService",["RequestService",function(requestService) {
            // Do Something
            // 具体示例参照 Angular Js Service 定义
        }])
        // Angular Directive 注册
        $app.directive("ys-framework-dropdown",[function() {
            // Do Something
            // 具体示例参照 Angular Js Directive 定义
        }])
        // Angular Controller 注册
        $app.controller("MainController",["$scope",function($scope) {
            // Do Something
            // 具体示例参照 Angular Js Controller 定义
        }])
  }
};
```

## ready

* 类型：`Function`
* 默认值：`angular.noop`
* 参数：`$app`

这里主要是值 Angular Js 初始化完毕。

```js
window.$app = {
    ready: function($app) {
        // 可以获取之前定义的 service 对象。
        var userService=$app.injector.get("UserService");
    }
};
```

## session

* 类型：`Object`
* 默认值：`{太长写不下、见下文}`

会话信息，包含用户登录状态，和 统一配置、数据字典等信息

```js
window.$app = {
    session:{
        code: 200,
        message:'已登录！',
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
};
```

## requestTimeout

* 类型：`Function`
* 默认值：`{太长写不下、见下文}`
* 参数：`$app`

请求超时钩子

```js
window.$app = {
    requestTimeout:function() {
        $app.loading(false);
        $app.dialog.error({
            message: "很抱歉！<br/>由于您的网络原因、请求失败。",
            buttons: [{text: "我要重试", result: true}]
        }).then(function () {
            // 路由刷新
            $app.router.reload();
        })
    }
};
```

## responseError

* 类型：`Function`
* 默认值：`{太长写不下、见下文}`
* 参数：`$app`、`message`

响应异常钩子

```js
window.$app = {
    // http 状态
    // response.status == -1 || response.status == 504 || response.status == 502
    // response.data.code == 500
    responseError: function ($app, response /* 错误内容 */) {
        $app.loading(false);
        $app.dialog.error({
            message: "很抱歉！<br/>由于服务器内部错误、请求失败。",
            buttons: [{text: "我要重试", result: true}]
        }).then(function () {
            // 整体页面刷新
            window.location.reload();
        })
    }
};
```


## needLogin

* 类型：`Function`
* 默认值：`{太长写不下、见下文}`
* 参数：`$app`

未登录或会话超时钩子

```js
window.$app = {
    // response.data.code == -100
    needLogin: function ($app, response) {
        $app.loading(false);
        $app.dialog.error({
            message: "很抱歉！<br/>" + ($app.user.login ? "会话超时、请重新登陆！" : "您尚未登陆、请先去登陆！"),
            buttons: [{text: "去登陆", result: true}]
        }).then(function () {
            window.location.href = response.data.login.split("_srk_")[0] + "_srk_=" + encodeURIComponent(window.location.href);
        })
    }
};
```