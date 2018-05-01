# 数据处理

提供通用的数据处理函数

```html
<script>
    $app.data.xxx
</script>
```

## eq

* 参数：`source`、`target`

比较内容是否相同 


```js
// 示例
if($app.data.eq('yueshang','yueshang')){
    console.log("相同");   
}else{
    console.log("不相同");
}
```        