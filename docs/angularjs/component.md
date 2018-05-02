# 常用组件

下拉框、编辑控制、错误提示、图标、上传


## ys-framework-dropdown
参数说明
* model 模型，用于回显默认值、和选中后的赋值操作。
* dictionary 字典项，支持数组或字符串，字符串则取 $app.dictionary[xxx] 内的数据

静态下拉框
```html
<div ys-framework-dropdown="{model:{},dictionary:[{text:'上海七宝万科',id:1024}]}"/>

```
字典下拉框
```html
<div ys-framework-dropdown="{model:{},dictionary:'PROJECTS'"/>
```

异步下拉框
```html
<div ys-framework-dropdown="{model:{},async:true,handler:queryProjectHandler}"/>
```

异步 service.quick 下拉框
```html
<div ys-framework-dropdown="{model:{},async:true,handler:'project'}"/>
```

## ys-framework-edit
* `待述`

## ys-framework-error
* `待述`

## ys-framework-icon
* `待述`