/*
 * @Author: Whzcorcd
 * @Date: 2020-05-08 09:30:56
 * @LastEditTime: 2020-06-19 17:15:17
 * @Description: Tool's main entry
 * @FilePath: /gdy-sentry-plugin/bin/index.js
 */
const Sentry = require('@sentry/browser')
// const Integrations = require('@sentry/integrations')

Report.init = function(option) {
  const opt = {
    // sentry dsn
    dsn: '',
    // 版本信息
    version: '1.0.0',
    // 环境变量
    env: ''
  }

  Object.assign(opt, option)

  let environment = ''
  switch (opt.env) {
    case 'TEST':
      environment = 'development'
      break
    case 'PRE':
      environment = 'preview'
      break
    case '':
      environment = 'production'
      break
    default:
      environment = 'production'
      break
  }
  Sentry.init({
    dsn: String(opt.dsn),
    release: opt.version,
    environment: environment
  })
}

Report.setUser = function(appid, uin, name = '', env = '') {
  let environment = ''
  switch (env) {
    case 'TEST':
      environment = 'development'
      break
    case 'PRE':
      environment = 'preview'
      break
    case '':
      environment = 'production'
      break
    default:
      environment = 'production'
      break
  }
  Sentry.setUser({
    AppId: appid,
    Uin: uin,
    Name: name,
    Environment: environment
  })
}

Report.api = function(appid, uin, msg, data = {}) {
  Sentry.configureScope(function(scope) {
    scope.setTag('appid', appid)
    scope.setTag('uin', uin)
  })
  Sentry.setTag('Uin', uin)
  Sentry.setTag('Appid', appid)
  Sentry.setExtra('data', data)
  Sentry.captureException(new Error(`Api Error:${msg}`))
}

Report.info = function(appid, uin, msg = 'Info', data = {}) {
  Sentry.configureScope(function(scope) {
    scope.setTag('appid', appid)
    scope.setTag('uin', uin)
  })
  Sentry.setTag('Uin', uin)
  Sentry.setTag('Appid', appid)
  Sentry.setExtra('data', data)
  Sentry.captureMessage(msg, 'info')
}

Report.error = function(appid, uin, msg = 'New Error', data = {}) {
  Sentry.configureScope(function(scope) {
    scope.setTag('appid', appid)
    scope.setTag('uin', uin)
  })
  Sentry.setTag('Uin', uin)
  Sentry.setTag('Appid', appid)
  Sentry.setExtra('data', data)
  Sentry.captureException(new Error(msg))
}

// report
function Report(option) {
  try {
    const filterUrl = [
      '/sockjs-node/info',
      'arms-retcode.aliyuncs.com',
      'aliyuncs.com',
      'ynuf.aliapp.org'
    ]
    const apiRules = [
      {
        url: 'guangdianyun.tv',
        rules: {
          data: { name: 'data', permission: [] },
          identify: { name: 'errorCode', permission: [0, 1] },
          msg: { name: 'errorMessage', permission: [] }
        }
      }
      // {
      //   url: 'aodianyun.com',
      //   rules: {
      //     data: { name: 'data', permission: [] },
      //     identify: { name: 'code', permission: [0] },
      //     msg: { name: 'msg', permission: [] }
      //   }
      // }
    ]
    const opt = {
      // sentry dsn
      dsn: '',
      // 版本信息
      version: '1.0.0',
      // 环境变量
      env: '',
      // appid
      appid: '',
      // uin
      uin: 0,
      // 项目名称
      name: '',
      // 脚本延迟上报时间
      outtime: 300,
      // ajax 请求时需要过滤的 url 信息
      filterUrl: [],
      // api 校验规则
      apiRules: [],
      // 是否上报页面性能数据
      isPage: false,
      // 是否上报 ajax 数据
      isAjax: true,
      // 是否上报错误信息
      isError: true
    }
    // apiRules 格式
    // const apiRules = {
    //   url: 'xxxxx',
    //   rules: {
    //     data: { name: 'data', permission: [] },
    //     identify: { name: 'data', permission: [] },
    //     msg: { name: 'errorMessage', permission: [] }
    //   }
    // }

    Object.assign(opt, option)
    opt.filterUrl = opt.filterUrl.concat(filterUrl)
    opt.apiRules = opt.apiRules.concat(apiRules)
    console.log(opt)

    let environment = ''
    switch (opt.env) {
      case 'TEST':
        environment = 'development'
        break
      case 'PRE':
        environment = 'preview'
        break
      case '':
        environment = 'production'
        break
      default:
        environment = 'production'
        break
    }

    // 统计页面性能
    function perforPage() {
      if (!window.performance) return
      const timing = performance.timing
      const data = {
        width:
          document.documentElement.clientWidth || document.body.clientWidth,
        height:
          document.documentElement.clientHeight || document.body.clientHeight,
        // DNS解析时间
        dnst: timing.domainLookupEnd - timing.domainLookupStart || 0,
        //TCP建立时间
        tcpt: timing.connectEnd - timing.connectStart || 0,
        // 白屏时间
        wit: timing.responseStart - timing.navigationStart || 0,
        //dom渲染完成时间
        domt: timing.domContentLoadedEventEnd - timing.navigationStart || 0,
        //页面onload时间
        lodt: timing.loadEventEnd - timing.navigationStart || 0,
        // 页面准备时间
        radt: timing.fetchStart - timing.navigationStart || 0,
        // 页面重定向时间
        rdit: timing.redirectEnd - timing.redirectStart || 0,
        // unload时间
        uodt: timing.unloadEventEnd - timing.unloadEventStart || 0,
        //request请求耗时
        reqt: timing.responseEnd - timing.requestStart || 0,
        //页面解析dom耗时
        andt: timing.domComplete - timing.domInteractive || 0
      }
      reportData('info', 'Page Performance', data)
    }

    // 类型分配
    function sortOut(responseURL, xhr) {
      const ruleObject = opt.apiRules.filter(item =>
        responseURL.includes(item.url)
      )
      if (ruleObject.length > 1) {
        console.error('API 规则定义重复')
        return false
      }
      else if(!ruleObject) {
        console.error('当前缺少匹配的规则')
        return false
      }

      const rules = ruleObject[0].rules || null
      if (!rules) return false

      // 解析数据
      const response = {}
      if (
        xhr.xhr.response &&
        typeof xhr.xhr.response === 'string' &&
        xhr.xhr.response.length > 0
      ) {
        try {
          const temp = JSON.parse(xhr.xhr.response)
          Object.assign(response, temp)
        } catch (e) {}
      }

      // 接口校验
      let res = false

      for (const item in rules) {
        console.log(rules[item])
        if (
          rules[item].permission.length !== 0 &&
          !rules[item].permission.includes(response[rules[item].name])
        )
          res = true
      }

      const data = {
        status: xhr.xhr.status,
        statusText: xhr.xhr.statusText || '',
        method: xhr.args.method,
        responseURL: xhr.args.url,
        data: response[rules.data.name] || null,
        identify: response[rules.identify.name] || null,
        msg: response[rules.msg.name] || ''
      }
      res && ajaxResponse('done', data)
    }

    // report date
    function reportData(type, msg = '', data = {}) {
      setTimeout(() => {
        if (type === 'info') {
          Sentry.setExtra('data', data)
          Sentry.captureMessage(msg, 'info')
        } else if (type === 'error') {
          Sentry.setExtra('data', data)
          Sentry.captureException(new Error(msg))
        }

        // 清空无关数据
        Promise.resolve().then(() => {
          clear()
        })
      }, opt.outtime)
    }

    // ajax重写
    function _Ajax(proxy) {
      window._ahrealxhr = window._ahrealxhr || XMLHttpRequest
      XMLHttpRequest = function() {
        this.xhr = new window._ahrealxhr()
        for (var attr in this.xhr) {
          var type = ''
          try {
            type = typeof this.xhr[attr]
          } catch (e) {}
          if (type === 'function') {
            this[attr] = hookfun(attr)
          } else {
            Object.defineProperty(this, attr, {
              get: getFactory(attr),
              set: setFactory(attr)
            })
          }
        }
      }

      function getFactory(attr) {
        return function() {
          var v = this.hasOwnProperty(attr + '_')
            ? this[attr + '_']
            : this.xhr[attr]
          var attrGetterHook = (proxy[attr] || {})['getter']
          return (attrGetterHook && attrGetterHook(v, this)) || v
        }
      }

      function setFactory(attr) {
        return function(v) {
          var xhr = this.xhr
          var that = this
          var hook = proxy[attr]
          if (typeof hook === 'function') {
            try {
              xhr[attr] = function() {
                proxy[attr](that) || v.apply(xhr, arguments)
              }
            } catch (e) {}
          } else {
            var attrSetterHook = (hook || {})['setter']
            v = (attrSetterHook && attrSetterHook(v, that)) || v
            try {
              xhr[attr] = v
            } catch (e) {
              this[attr + '_'] = v
            }
          }
        }
      }

      function hookfun(fun) {
        return function() {
          var args = [].slice.call(arguments)
          if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
            return
          }
          return this.xhr[fun].apply(this.xhr, args)
        }
      }
      return window._ahrealxhr
    }

    // 拦截js error信息
    function _error() {
      // img, script, css, jsonp
      window.addEventListener(
        'error',
        function(e) {
          const data = {
            t: new Date().getTime(),
            msg: e.target.localName + ' is load error',
            target: e.target.localName,
            type: e.type,
            resourceUrl: e.target.href || e.target.currentSrc
          }
          reportData('error', 'Resource Error', data)
        },
        true
      )
      // js
      window.onerror = function(msg, _url, line, col, error) {
        setTimeout(function() {
          col = col || (window.event && window.event.errorCharacter) || 0
          const data = {
            t: new Date().getTime(),
            msg: error && error.stack ? error.stack.toString() : msg,
            resourceUrl: _url,
            line: line,
            col: col
          }
          // 上报错误信息
          reportData('error', 'Script Error', data)
        }, 0)
      }
      window.addEventListener('unhandledrejection', function(e) {
        const error = e && e.reason
        const message = error.hasOwnProperty('message') ? error.message : ''
        const stack = error.stack || ''
        // Processing error
        let resourceUrl, col, line
        let errs = stack.match(/\(.+?\)/)
        if (errs && errs.length) {
          errs = errs[0]
          errs = errs.replace(/\w.+[js|html]/g, $1 => {
            resourceUrl = $1
            return ''
          })
          errs = errs.split(':')
        }
        if (errs && errs.length > 1) line = parseInt(errs[1] || 0, 10)
        if (errs && errs.length > 2) col = parseInt(errs[2] || 0, 10)
        const data = {
          t: new Date().getTime(),
          msg: message,
          resourceUrl: resourceUrl,
          line: col,
          col: line
        }
        reportData('error', 'Unhandledrejection', data)
      })
      // 重写console.error
      const oldError = console.error
      console.error = function(e) {
        setTimeout(function() {
          const data = {
            t: new Date().getTime(),
            msg: e,
            resourceUrl: location.href
          }
          reportData('error', 'Console Error', data)
        }, 0)
        return oldError.apply(console, arguments)
      }
    }

    // ajax统一上报入口
    function ajaxResponse(type, data) {
      const url = data.responseURL
      if (filterUrl.some(item => url.includes(item))) {
        return
      }
      switch (type) {
        case 'done':
          Sentry.setExtra('data', data)
          Sentry.captureException(
            new Error(`Api Error:${data.msg || data.statusText}`)
          )
          break
        case 'error':
          Sentry.setExtra('data', data)
          Sentry.captureException(new Error(`Request Error:${data.statusText}`))
          break
        default:
          break
      }
    }

    function clear() {
      if (window.performance && window.performance.clearResourceTimings)
        performance.clearResourceTimings()
    }

    Sentry.init({
      dsn: opt.dsn,
      release: opt.version,
      environment: environment
    })

    Sentry.setUser({
      AppId: opt.appid,
      Uin: opt.uin,
      Name: opt.name,
      Environment: environment
    })

    Sentry.setTag('Package', require('../package.json').version)
    Sentry.setTag('Uin', opt.uin)
    Sentry.setTag('Appid', opt.Appid)

    // error上报
    if (opt.isError) _error()

    //  拦截ajax
    if (opt.isAjax || opt.isError) {
      _Ajax({
        onreadystatechange: function(xhr) {
          // 0：初始化，XMLHttpRequest 对象还没有完成初始化
          // 1：载入，XMLHttpRequest 对象开始发送请求
          // 2：载入完成，XMLHttpRequest 对象的请求发送完成
          // 3：解析，XMLHttpRequest 对象开始读取服务器的响应
          // 4：完成，XMLHttpRequest 对象读取服务器响应结束
          // console.log(xhr)
          if (xhr.xhr.readyState === 4) {
            const responseURL = xhr.xhr.responseURL ? xhr.xhr.responseURL : ''
            if (
              opt.filterUrl.some(item => responseURL.includes(item)) ||
              !responseURL
            ) {
              return
            }

            setTimeout(() => {
              if (xhr.xhr.status < 200 || xhr.xhr.status > 300) {
                xhr.method = xhr.args.method
                const data = {
                  status: xhr.xhr.status,
                  statusText: xhr.xhr.statusText || '',
                  method: xhr.args.method,
                  responseURL: xhr.args.url,
                  data: xhr.xhr.response || null,
                  msg: ''
                }
                ajaxResponse('done', data)
              } else {
                sortOut(responseURL, xhr)
              }
            }, 600)
          }
        },
        onerror: function(xhr) {
          if (xhr.args) {
            const responseURL = xhr.args.url ? xhr.args.url : ''
            if (
              opt.filterUrl.some(item => responseURL.includes(item)) ||
              !responseURL
            ) {
              return
            }
            const data = {
              method: xhr.args.method,
              responseURL: responseURL,
              statusText: 'XHR request error'
            }
            ajaxResponse('error', data)
          }
        },
        open: function(arg, xhr) {
          this.args = {
            url: arg[1],
            method: arg[0] || 'GET',
            type: 'xmlhttprequest'
          }
          clear()
        }
      })
    }

    // 绑定onload事件
    window.addEventListener(
      'load',
      function() {
        //页面性能上报
        if (opt.isPage) perforPage()
      },
      false
    )
  } catch (err) {
    console.log(err)
  }
}

if (typeof exports === 'object') {
  module.exports = Report
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return Report
  })
} else {
  window.Report = Report
}
