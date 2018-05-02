<!-- ============================== 标题 ============================== -->
# 数据处理
* namespace：` $app.data `


## eq

* 参数：`source`、`target`

比较内容是否相同 

```js
// 示例
console.log($app.data.eq(undefined,'yueworld'));        // 输出 false
console.log($app.data.eq('yueshang','yueworld'));       // 输出 false
console.log($app.data.eq('yueshang','yueshang'));       // 输出 true
```