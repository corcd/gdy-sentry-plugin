<!--
 * @Author: your name
 * @Date: 2020-05-08 09:10:36
 * @LastEditTime: 2020-05-09 17:42:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /gdy-sentry-plugin/README.md
 -->

# gdy-sentry-plugin

广电云非侵入式 Sentry 前端异常自动上报工具，可以一行代码实现 XHR/Fetch 异常收集、错误信息上报、页面性能统计等功能

> 目前暂时支持普通 js 项目和 vue 项目，未来计划支持 react、node 等

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

| parameter name | describe     | explain                   |
| -------------- | ------------ | ------------------------- |
| dsn            | sentry Dsn   | 从 sentry 项目中获取      |
| version        | 当前项目版本 |                           |
| env            | 环境变量     | TEST/PRE/（空）           |
| appid          | 唯一标识     | 可为 appid 或其他唯一标识 |
| uin            | 用户 uin     |                           |
| name           | 项目名称     |                           |

### 参考示例

```javascript
import Report from 'gdy-report'

Report({
  dsn: 'https://xxxxxxxxxxxxxxxxx@sentry.guangdianyun.tv/3',
  version: pConfig.version,
  env: env,
  appid: appid,
  uin: uin,
  name: 'Lcps-Monitor'
})
```

### TODO

- [ ] 同时支持广电云 & 奥点云数据结构
- [ ] 支持外部导入数据结构规则
- [ ] 支持 React
- [ ] 支持 Node 环境
- [ ] class 改写，支持外部指令
