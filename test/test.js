/*
 * @Author: Whzcorcd
 * @Date: 2020-06-10 13:46:11
 * @LastEditors: Wzhcorcd
 * @LastEditTime: 2020-06-10 14:30:28
 * @Description: file content
 */
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 9000

app.use(bodyParser.json({ limit: '2mb' })) //body-parser 解析 json 格式数据
app.use(
  bodyParser.urlencoded({
    //此项必须在 bodyParser.json 之后,为参数编码
    extended: true
  })
)

//配置跨域
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

//默认响应体
const gdy_rep_body = {
  code: 0,
  data: {},
  errorCode: 0,
  errorMessage: ''
}

const aodian_rep_body = {
  code: 0,
  data: {},
  msg: 0
}

// 200 正常状态
app.get('/test/gdy/normal', (req, res, next) => {
  const response = Object.assign({}, gdy_rep_body, {})
  res.json(response)
})

// 200 未登录状态
app.get('/test/gdy/notlogin', (req, res, next) => {
  const response = Object.assign({}, gdy_rep_body, {
    errorCode: 1,
    errorMessage: 'Not log in'
  })
  res.json(response)
})

// 200 其他状态
app.get('/test/gdy/other', (req, res, next) => {
  const response = Object.assign({}, gdy_rep_body, {
    errorCode: 999,
    errorMessage: 'Other errors'
  })
  res.json(response)
})

// 4xx
app.get('/test/gdy/clienterror', (req, res, next) => {
  const response = Object.assign({}, gdy_rep_body, {})
  res.json(response)
})

// 5xx
app.get('/test/gdy/servererror', (req, res, next) => {
  console.log(notexist)
  res.json(response)
})

app.listen(port, () => {
  console.log(`测试服务启动成功! 端口号：${port}`)
})
