<!-- ============================== 标题 ============================== -->
# 其他辅助函数
* namespace：` $app.helper`


## trim

* 参数：`content`

剔除空格 

```js
// 示例
console.log($data.helper.trim(' yueworld '));
// 输出 yueworld
```

## firstUpperCase

* 参数：`content`

首字母大写 

```js
// 示例
console.log($data.helper.firstUpperCase('yueworld'));
// 输出 Yueworld
```

## template

* 参数：`expr`、`parameters`

简易模版引擎 

```js
// 示例
console.log($data.helper.template('欢迎${username}、使用系统！',{username:"超级管理员"}));
// 输出 欢迎超级管理员、使用系统！
```