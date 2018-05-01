<!-- ============================== 标题 ============================== -->
# 数据校验
* namespace：` $app.valid `

<!-- ============================== isEmpty ========================== -->
## isEmpty
* 参数：`content`、`nullValue` 

验证`content`是否为空、当 `content` 等于 `nullValue` 时 同样返回 true
```js
// 示例
console.log($app.valid.isEmpty(''));                    // 输出 true
console.log($app.valid.isEmpty(null));                  // 输出 true
console.log($app.valid.isEmpty(undefined));             // 输出 true
console.log($app.valid.isEmpty(0));                     // 输出 true
console.log($app.valid.isEmpty('yueshang','yueshang'))  // 输出 true
console.log($app.valid.isEmpty('yueshang'))             // 输出 false
```

<!-- ============================== isNotEmpty ======================= -->
## isNotEmpty
* 参数：`content`、`nullValue`

与上边函数功能一致、`取反`！

<!-- ============================== isNumber ========================= -->
## isNumber
* 参数：`content` 

验证`content`是否为数字
```js
// 示例
console.log($app.valid.isNumber(''));           // 输出 false
console.log($app.valid.isNumber(null));         // 输出 false
console.log($app.valid.isNumber(undefined));    // 输出 false
console.log($app.valid.isNumber('a'));          // 输出 false
console.log($app.valid.isNumber(0));            // 输出 true
console.log($app.valid.isNumber('1'));          // 输出 true
console.log($app.valid.isNumber('1.1'));        // 输出 true
console.log($app.valid.isNumber('1.1111'));     // 输出 true
console.log($app.valid.isNumber('1.111a'));     // 输出 false

```

<!-- ============================== isDate ========================= -->
## isDate
* 参数：`content`

<!-- ============================== isMobile ========================= -->
## isMobile
* 参数：`content`

<!-- ============================== isEmail ========================= -->
## isEmail
* 参数：`content`

<!-- ============================== isLength ========================= -->
## isLength
* 参数：`content`

<!-- ============================== isBetween ========================= -->
## isBetween
* 参数：`content`

<!-- ============================== isUrl ========================= -->
## isUrl
* 参数：`content`
