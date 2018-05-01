# 快速开始

安装`yueworld-cli`工具，快速构建一个基于`Webpack`并集成了`yeuworld.js`的项目。

```bash
npm i yueworld-cli -g
yueworld-cli --init
npm install
npm run server
```

## 手动初始化

如果不喜欢 npm 或者觉得安装工具太麻烦，其实只需要创建一个 index.html 文件。

*index.html*

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/yueworld/dist/min.css" type="text/css">
</head>
<body>
<h2 class="text-center">Wellcome!</h2>
<script type="text/javascript" src="https://unpkg.com/yueworld/dist/min.js"></script>
</body>
</html>
```


## Loading

如果您需要一个`Loading`界面。
* 方法一

 简洁
```html
<script type="text/javascript">
    window.$app={loading:true}
</script>
<script type="text/javascript" src="https://unpkg.com/yueworld/dist/min.js"></script>
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

隐藏与显示  
```js
// 隐藏
$app.loading(false);
// 显示
$app.loading(false);
```