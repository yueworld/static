<!-- ============================== 标题 ============================== -->
# 数字
* namespace：` $app.number `

## parse
* 参数：`content`、`precision`

将`content`转为数字、保留`precision`位绝对值

```js
// 示例
console.log($app.number.parse("12.345"));           // 输出 12
console.log($app.number.parse("12.345a",2));        // 输出 0.00
console.log($app.number.parse("12.3456",2));        // 输出 12.34
```

## add
* 参数：`v1`、`v2`、`precision`

高精度、返回 `v1`加`v2`的结果、保留`precision`位小数

```js
// 示例
console.log($app.number.add("12.12","12.12"));           // 输出 24.24
```

## subtract
* 参数：`v1`、`v2`、`precision`

高精度、返回 `v1`减`v2`的结果、保留`precision`位小数

```js
// 示例
console.log($app.number.subtract("12.12","12.12"));           // 输出 0
```

## multiply
* 参数：`v1`、`v2`、`precision`

高精度、返回 `v1`乘以`v2`的结果、保留`precision`位小数

```js
// 示例
console.log($app.number.multiply("12","1"));                 // 输出 12
```

## divide
* 参数：`v1`、`v2`、`precision`

高精度、返回 `v1`除以`v2`的结果、保留`precision`位小数

```js
// 示例
console.log($app.number.multiply("12","1"));                 // 输出 12
```