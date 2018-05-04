<!-- ============================== 标题 ============================== -->
# 断言
合理使用断言将使代码更易读、健壮。
* namespace：` $app.assert `

<!-- ============================== isTrue ========================== -->
## isTrue
* 参数：`cond`、`message`、`code`

当`cond`为真时抛出内容为`message`、代号为`code`的异常
```js
// 示例
var username = 'admin';
try {
    // $app.assert.isTrue(username != "admin", '用户名不匹配！', 1001);
    $app.assert.isTrue(username != "yueworld", '用户名不匹配！', 1001);
    $app.tip.success({message: "Very God、没有发生任何错误！"});
} catch (ex) {
    // 捕获处理
    $app.tip.error({
        message: $app.helper.template("msg:${msg}、code:${code}", {
            msg: ex.message, code: ex.code
        })
    })
}
```
[RunJs](http://runjs.cn/code/bkepuq8e ':target=_blank')


## isEmpty
* 参数：`content`、`message`、`code`

当`content`为空时抛出内容为`message`、代号为`code`的异常、

```js
// 示例
var username='';
try{
    $app.assert.isEmpty(username,'用户名为空！',1001);
}catch(ex){
    $app.tip.error({
        message:$app.helper.tempalte("msg:${msg}、code:${code}",{
            msg:ex.messge,code:ex.code
        })
    })
}
```