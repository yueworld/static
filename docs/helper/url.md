<!-- ============================== 标题 ============================== -->
# Url
* namespace：` $app.url `

## getParams
* 参数：`field`

读取当前URL 参数

```js
// 示例
// window.location.href="http://www.baidu.com?keyworkd=上海悦商";
console.log($app.url.getParams(keyworkd)); // 输出 上海悦商
```

## isCrossDomain
* 参数：`url`

获取 `url` 是否和当前地址属于相同域

```js
// 示例
// window.location.href="http://www.yueworld.cn";
console.log($app.url.isCrossDomain("http://www.yueworld.cn/pms/aaa.txt"));  // 输出 true
console.log($app.url.isCrossDomain("http://www.baidu.com/pms/aaa.txt"));  // 输出 false
```

## setDynamicUrl
* 参数：`url`

设置动态请求URL根、该参数将影响所有异步请求

```js
// 示例
$app.url.setDynamicUrl("/");
$app.url.setDynamicUrl("/enrolment_web/");
$app.url.setDynamicUrl("http://www.yueworld.cn/enrolment_web/");
```

## getDynamicUrl
* 参数：`url`

获取动态请求URL根

```js
// 示例
console.log($app.url.getDynamicUrl());          // 输出 base节点的href属性
$app.url.setDynamicUrl("/enrolment_web/");              
console.log($app.url.getDynamicUrl());          // 输出 /enrolment_web/
```

## setStaticUrl
* 参数：`url`

设置动态请求URL根、该参数将影响所有异步请求

```js
// 示例
$app.url.setStaticUrl("http://static.yeuworld.cn/static");
```

## getStaticUrl
* 参数：`url`



获取静态请求URL根

```js
// 示例
console.log($app.url.getStaticUrl());                       // 输出 http://static.yeuworld.cn/
$app.url.setStaticUrl("http://static.yeuworld.cn/static");  
console.log($app.url.getStaticUrl());                       // 输出 http://static.yeuworld.cn/static
```

## encoder

* 参数：`content`

编码 URL 

```js
// 示例
console.log($data.helper.encoder('http://www.baidu.com?realname=超级管理员'));
// 输出 http://www.baidu.com?realname=%E8%B6%85%E7%BA%A7%E7%AE%A1%E7%90%86%E5%91%98
```

## decoder

* 参数：`content`

解码 URL 
 
```js
// 示例
console.log($data.helper.encoder('http://www.baidu.com?realname=%E8%B6%85%E7%BA%A7%E7%AE%A1%E7%90%86%E5%91%98'));
// 输出 http://www.baidu.com?realname=超级管理员
```