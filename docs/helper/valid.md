<!-- ============================== 标题 ============================== -->
# 数据校验
* namespace：` $app.valid `

<!-- [](http://sandbox.runjs.cn/show/wdteo4jy ':include :type=iframe width=100% height=280px')
[RunJs](http://runjs.cn/code/wdteo4jy ':target=_blank') -->

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
console.log($app.valid.isEmpty(1));                     // 输出 false
console.log($app.valid.isEmpty('yueshang'))             // 输出 false
```
[RunJs](http://runjs.cn/code/mpgexdbi ':target=_blank')

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
[RunJs](http://runjs.cn/code/o7284wez ':target=_blank')

<!-- ============================== isInt ========================= -->
## isInt
* 参数：`content`

验证`content`是否整数 
```js
// 示例
console.log($app.valid.isInt("1.23"));           // 输出 false
console.log($app.valid.isInt("1.5"));           // 输出 false
console.log($app.valid.isInt("1"));              // 输出 true 
```
[RunJs](http://runjs.cn/code/i1tnctwm ':target=_blank')

<!-- ============================== isDate ========================= -->
## isDate
* 参数：`content`

验证`content`是否为日期
```js
// 示例
console.log($app.valid.isDate(''));                         // 输出 false
console.log($app.valid.isDate(null));                       // 输出 false
console.log($app.valid.isDate(undefined));                  // 输出 false
// 毫秒
console.log($app.valid.isDate(1525241712883));              // 输出 true
// 秒
console.log($app.valid.isDate(1525241712));                 // 输出 true
console.log($app.valid.isDate(20170812));                   // 输出 true
console.log($app.valid.isDate("2018-05-02"));               // 输出 true
console.log($app.valid.isDate("2018-05-02 12:12"));         // 输出 true
console.log($app.valid.isDate("2018年05月02日 12时12分"));   // 输出 true
```
[RunJs](http://runjs.cn/code/aahxrgdk ':target=_blank')

<!-- ============================== isMobile ========================= -->
## isMobile
* 参数：`content`

验证`content`是否为手机号
```js
// 示例
console.log($app.valid.isMobile(''));                    // 输出 false
console.log($app.valid.isMobile(15316313953));             // 输出 true
console.log($app.valid.isMobile("15316313953"));           // 输出 true
```
[RunJs](http://runjs.cn/code/sqlvmgdb ':target=_blank')

## isEmail
* 参数：`content`

验证`content`是否为邮箱地址
```js
// 示例
console.log($app.valid.isEmail("zhanggj@yueworld"));           // 输出 false
console.log($app.valid.isEmail("zhanggj@yueworld.cn"));        // 输出 true
```
[RunJs](http://runjs.cn/code/ixtahjz0 ':target=_blank')

## eq
* 参数：`source`, `target`

验证`source`是否等于`target` 
```js
// 示例
console.log($app.valid.eq("zhanggj","yueworld"));           // 输出 false
console.log($app.valid.eq("zhanggj","zhanggj"));            // 输出 true
```
[RunJs](http://runjs.cn/code/r2clanmz ':target=_blank')

<!-- ============================== isTextLength ========================= -->
## isTextLength
* 参数：`text`, `min`, `max`

验证`text`的长度是否在 `min`、`max` 之间
```js
// 示例
console.log($app.valid.isTextLength("zhanggj",10,30));      // 输出 false
console.log($app.valid.isTextLength("zhanggj",6,30));       // 输出 true
```
[RunJs](http://runjs.cn/code/rvk7usbo ':target=_blank')

## isNumberBetween
* 参数：`number`, `min`, `max`

验证`number`的值是否在 `min`、`max` 区间内

```js
// 示例
console.log($app.valid.isNumberBetween(10,20,30));      // 输出 false
console.log($app.valid.isNumberBetween(10,6,30));       // 输出 true
```
[RunJs](http://runjs.cn/code/eeheso3f ':target=_blank')

## startsWith
* 参数：`source`, `target`

验证`target` 是否与`source`开始部分相同
```js
// 示例
console.log($app.valid.startsWith("yueworld","yw"));      // 输出 false
console.log($app.valid.startsWith("yueworld","yuew"));    // 输出 true
```
[RunJs](http://runjs.cn/code/3szvjiff ':target=_blank')

<!-- ============================== endsWith ========================= -->
## endsWith
* 参数：`source`, `target`

验证`target` 是否与`source`结束部分相同
```js
// 示例
console.log($app.valid.endsWith("yueworld","yw"));       // 输出 false
console.log($app.valid.endsWith("yueworld","world"));    // 输出 true
```
[RunJs](http://runjs.cn/code/cv09qyfe ':target=_blank')