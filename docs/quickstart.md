# 快速开始

推荐安装`yueworld-cli`工具，快速构建一个基于`Webpack 4`并集成了`yeuworld.js`的项目。

```bash
npm i yueworld-cli -g
```

## 初始化项目

通过 init 初始化项目。

```bash
yueworld-cli --init
npm install
```

## 热调试

运行一个本地服务器通过 `npm run server` 可以方便的预览效果，而且提供 LiveReload 功能，可以实时的预览。默认访问 http://localhost:1024 。

## 合并压缩

通过 `npm run build` 输出 dist/* 。

## 手动初始化

如果不喜欢 `npm` 或者觉得安装工具太麻烦，其实只需要创建一个 `index.html` 文件。

*index.html*

```html
<!DOCTYPE html>
<html>
<head>
    <title>快速开始</title>
    <link rel="stylesheet" href="https://unpkg.com/yueworld/dist/min.css" type="text/css">
</head>
<body>
    <h2 class="text-center">welcome、见浏览器标题!</h2>
    <script type="text/javascript" src="https://unpkg.com/yueworld/dist/min.js"></script>
    <script type="text/javascript">
        // 启动应用
        $app.bootstrap({
            title:"My First Yueworld App ！",
            // 试试去掉注视、详情 见左侧配置项菜单
            // loading:true 
        })
    </script>
</body>
</html>
```