<!--
 * @Author: Wzhcorcd
 * @Date: 2020-05-08 09:10:36
 * @LastEditTime: 2020-05-11 11:33:35
 * @LastEditors: Wzhcorcd
 * @Description: In User Settings Edit
 * @FilePath: /gdy-sentry-plugin/README.md
 -->

# gdy-sentry-plugin

广电云非侵入式 Sentry 前端异常自动上报工具，可以一行代码实现 XHR/Fetch 异常收集、错误信息上报、页面性能统计等功能

> 目前暂时支持前端 js 项目，未来计划支持 node 等

## 引入方式

### 资源引用方式

1. 下载 dist/gdy-report.min.js 至本地
2. 使用 script 标签引入到 html 的头部（请放置在所有 js 资源之前）
3. 配置使用 Report

```html
<html>
  <head>
    <meta charset="UTF-8" />
    <title>report test</title>
    <script src="../dist/gdy-report.min.js"></script>
    <script>
      Report({
        dsn: '...Your Sentry Dsn'
      })
    </script>
  </head>
</html>
```

### NPM 引入方式

```bash
npm install gdy-report --save
yarn add gdy-report
```

```javascript
import Report from 'gdy-report'
```

### 参数配置

| parameter name | describe             | explain                   |
| -------------- | -------------------- | ------------------------- |
| dsn            | sentry Dsn           | 从 sentry 项目中获取      |
| version        | 当前项目版本         |                           |
| env            | 环境变量             | TEST/PRE/（空）           |
| appid          | 唯一标识             | 可为 appid 或其他唯一标识 |
| uin            | 用户 uin             |                           |
| name           | 项目名称             |                           |
| outtime        | 脚本延迟上报时间     | 默认 300ms                |
| isPage         | 是否上报页面性能数据 | 默认 true                 |
| isAjax         | 是否上报 ajax 数据   | 默认 true                 |
| isError        | 是否上报错误信息     | 默认 true                 |

### 参考示例

```javascript
import Report from 'gdy-report'

Report({
  dsn: 'https://xxxxxxxxxxxxxxxxx@sentry.guangdianyun.tv/3',
  version: '1.0.2',
  env: 'TEST',
  appid: 'xxxxxxxxx',
  uin: 1000,
  name: 'Lcps-Monitor'
})
```

### 外部命令

#### Report.init

提供在工具加载后初始化 Sentry 信息的功能，支持对象参数导入，对象支持 3 个参数（dsn，version，env），配置规则同配置列表所示

```javascript
const option = {
  // sentry dsn
  dsn: 'https://xxxxxxxxxxxxxxxxx@sentry.guangdianyun.tv/3',
  // 版本信息
  version: '1.0.0',
  // 环境变量
  env: 'TEST'
}
Report.init(option)
```

#### Report.serUser

提供在工具加载后设置 Sentry 用户信息的功能，支持 4 个参数（appid, uin，name，env），配置规则同配置列表所示

```javascript
Report.setUser('xxxxxx', 1000, 'Lcps', 'TEST')
```

#### Report.api

提供在自定义上报 Api 异常的功能，支持 3 个参数（appid, uin，data），其中 data 为数据体，配置规则同配置列表所示

```javascript
const { data } = await API()
Report.api('xxxxxx', 1000, data)
```

#### Report.info

提供在自定义上报提示信息的功能，支持 4 个参数（appid, uin，msg, data），其中 msg 为信息内容，data 为数据体，配置规则同配置列表所示

```javascript
const str = 'hello world'
Report.api('xxxxxx', 1000, 'init message', str)
```

#### Report.error

提供在自定义上报提示信息的功能，支持 4 个参数（appid, uin，msg, data），其中 msg 为错误内容，data 为数据体，配置规则同配置列表所示

```javascript
const error = 'data is undefined'
Report.api('xxxxxx', 1000, 'i get error', error)
```

### TODO

- [x] 同时支持广电云 & 奥点云数据结构
- [x] 支持外部指令
- [ ] 支持外部导入数据结构规则
- [x] 支持 React
- [ ] 支持 Node 环境
- [ ] class 改写
