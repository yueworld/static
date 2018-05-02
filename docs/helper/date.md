<!-- ============================== 标题 ============================== -->
# 日期处理
* namespace：` $app.date `


## now

取当前系统时间 

```js
// 示例
console.log($app.date.now.getTime());                       //  当前时间毫秒值
console.log($app.date.format("yyyy-MM-dd",$app.date.now))   //  当前时间 yyyy-MM-dd
```

## parse
* 参数：`content`

将`content`转换为日期 Date 类型、支持 8 中数据格式

```js
// 示例
// yyyyMMdd        
console.log($app.date.parse("20180502"))                 // 输出日期
// 秒值
console.log($app.date.parse("1525271112"))               // 输出日期
// yyyyMMddHHmm
console.log($app.date.parse("201805021232"))             // 输出日期
// 毫秒值
console.log($app.date.parse("1525271088641"))            // 输出日期
// yyyy-MM-dd
console.log($app.date.parse("2008-05-02"))               // 输出日期
// yyyy-MM-dd hh:mm
console.log($app.date.parse("2008-05-02 02:12"))         // 输出日期
// yyyy年MM月dd日
console.log($app.date.parse("2008年05月02"))              // 输出日期
// yyyy年MM月dd日 hh时mm分
console.log($app.date.parse("2008年05月02日 02时12分"))    // 输出日期
```

## format
* 参数：`expr`, `date`

按照`expr`格式返回 `date` 

```js
// 示例
console.log($app.date.format("yyyy-MM-dd",new Date(2018,05,04)))     // 2017-05-04
console.log($app.date.format("yyyy年MM月dd日",new Date(2018,05,04)))  // 2017年05月04日
console.log($app.date.format("HH点mm分",new Date(2018,05,04,12,34)))  // 12点34分
```

## add
* 参数：`date`, `expr`, `value`

日期加减 `expr` 可选范围(y、M、d、w、h、m、s、ms) `value` 可为负数

```js
// 示例
console.log($app.date.add("2018-05-03","y",1))      // 输出 Date(2019-05-03) 
console.log($app.date.add("2018-05-03","y",-2))     // 输出 Date(2016-05-03)
console.log($app.date.add("2018-05-03","d",1))      // 输出 Date(2018-05-04)
console.log($app.date.add("2018-05-03","m",-2))     // 输出 Date(2018-03-04)
```

## compare
* 参数：`start`、`end`

比较日期、返回开始和结束日期、以及 年、月、日 差

```js
// 示例
var result=$app.date.compare(new Date(2018,05,04),new Date(2021,06,05));
    result={
        start   :   new Date(2018,05,04)    ,
        end     :   new Date(2021,05,03)    ,
        year    :   3   ,
        month   :   1   ,
        day     :   2
    }
```

## toMs
* 参数：`content`

取毫秒 

```js
// 示例
console.log($app.date.toMs("20180503"));        // 输出13位的毫秒值
console.log($app.date.toMs("2018-05-03"));      // 输出13位的毫秒值
console.log($app.date.toMs(new Date()));        // 输出13位的毫秒值
```


## min
* 参数：`d1`、`d2`

返回取较小的时间 

```js
// 示例
console.log($app.date.min("2018-05-03","2016-05-03"));      // 输出 Date(2016-05-03)
```

## max
* 参数：`d1`、`d2`

返回取较大的时间 

```js
// 示例
console.log($app.date.max("2018-05-03","2016-05-03"));      // 输出 Date(2018-05-03)
```

## spacingText
* 参数：`start`、`end`、`format`

获取两个日期之间的文本周期 

```js
// 示例
console.log($app.date.spacingText("2016-05-03","2018-05-05"));                  // 输出 2年2天
console.log($app.date.spacingText("2016-05-03","2018-05-03","y年m个月d天"));     // 输出 2年0个月0天
```

## spacingYear
* 参数：`start`、`end`

获取两个日期之间的时间周期（年）

```js
// 示例
var years=$app.date.spacingYear("2016-05-03","2018-05-05");
    year=[
        {index:1,year:2016,start:"2016-05-03",end:"2017-05-02",day:365},
        {index:2,year:2017,start:"2017-05-03",end:"2018-05-02",day:365},
        {index:3,year:2018,start:"2018-05-03",end:"2017-05-05",day:3}
    ]
```

## msToText
* 参数：`duration`

毫秒值转文本 

```js
// 示例
var duration=$app.date.add(new Date(),"y",1).getTime()-new Date().getTime();
console.log($app.date.msToText(new Date().getTime()));          // 输出 365 天

duration=new Date().getTime()-$app.date.add(new Date(),"d",-1).getTime();
console.log($app.date.msToText(new Date().getTime()));          // 输出 24 小时

duration=new Date().getTime()-$app.date.add(new Date(),"m",-30).getTime();
console.log($app.date.msToText(new Date().getTime()));          // 输出 30 分钟
```