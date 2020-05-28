/*
 * @Author: Whzcorcd
 * @Date: 2020-05-08 09:30:56
 * @LastEditTime: 2020-05-26 10:10:11
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

  let str = ''
  switch (opt.env) {
    case 'TEST':
      str = 'development'
      break
    case 'PRE':
      str = 'preview'
      break
    case '':
      str = 'production'
      break
    default:
      str = 'production'
      break
  }
  Sentry.init({
    dsn: String(opt.dsn),
    release: opt.version,
    environment: str
  })
}

Report.setUser = function(appid, uin, name = '', env = '') {
  Sentry.setUser({
    AppId: appid,
    Uin: uin,
    Name: name,
    Environment: env
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
      'ynuf.aliapp.org'
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
      // ajax请求时需要过滤的url信息
      filterUrl: [],
      // 是否上报页面性能数据
      isPage: false,
      // 是否上报ajax数据
      isAjax: true,
      // 是否上报错误信息
      isError: true
    }
    Object.assign(opt, option)
    opt.filterUrl = opt.filterUrl.concat(filterUrl)
    console.log(opt)
    let str = ''
    switch (opt.env) {
      case 'TEST':
        str = 'development'
        break
      case 'PRE':
        str = 'preview'
        break
      case '':
        str = 'production'
        break
      default:
        str = 'production'
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

    // report date
    function reportData(type, msg = '', data = {}) {
      setTimeout(() => {
        if (type === 'info') {
          Sentry.setTag('Uin', opt.uin)
          Sentry.setExtra('data', data)
          Sentry.captureMessage(msg, 'info')
        } else if (type === 'error') {
          Sentry.setTag('Uin', opt.uin)
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
            xhr[attr] = function() {
              proxy[attr](that) || v.apply(xhr, arguments)
            }
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
          Sentry.setTag('Uin', opt.uin)
          Sentry.setTag('Appid', opt.Appid)
          Sentry.setExtra('data', data)
          Sentry.captureException(
            new Error(`Api Error:${data.msg || data.statusText}`)
          )
          break
        case 'error':
          Sentry.setTag('Uin', opt.uin)
          Sentry.setTag('Appid', opt.Appid)
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

    // if (window.Vue && opt.isError) {
    //   Sentry.init({
    //     dsn: opt.dsn,
    //     integrations: [
    //       new Integrations.Vue({
    //         Vue,
    //         attachProps: true
    //       })
    //     ],
    //     release: opt.version,
    //     environment: str
    //   })
    // } else {
    Sentry.init({
      dsn: opt.dsn,
      release: opt.version,
      environment: str
    })

    Sentry.setUser({
      AppId: opt.appid,
      Uin: opt.uin,
      Name: opt.name,
      Environment: str
    })

    // error上报
    if (opt.isError) _error()

    //  拦截ajax
    if (opt.isAjax || opt.isError) {
      _Ajax({
        onreadystatechange: function(xhr) {
          if (xhr.readyState === 4) {
            try {
              const responseURL = xhr.xhr.responseURL
                ? xhr.xhr.responseURL.split('?')[0]
                : ''
              if (
                opt.filterUrl.some(item => responseURL.includes(item)) ||
                !responseURL
              ) {
                return
              }
              setTimeout(() => {
                if (xhr.status < 200 || xhr.status > 300) {
                  xhr.method = xhr.args.method
                  const response = xhr.xhr.response
                    ? JSON.parse(xhr.xhr.response)
                    : {}
                  const data = {
                    status: xhr.status,
                    statusText: xhr.xhr.statusText || '',
                    method: xhr.args.method,
                    responseURL: xhr.args.url,
                    data: response.data || null,
                    msg: ''
                  }
                  ajaxResponse('done', data)
                } else {
                  const response = xhr.xhr.response
                    ? JSON.parse(xhr.xhr.response)
                    : {}
                  // 广电云接口
                  if (
                    responseURL.includes('guangdianyun') &&
                    Number(response.errorCode) !== 0 &&
                    Number(response.errorCode) !== 1
                  ) {
                    const data = {
                      origin: 'gdy',
                      status: xhr.status,
                      statusText: xhr.xhr.statusText || '',
                      method: xhr.args.method,
                      responseURL: xhr.args.url,
                      data: response.data || null,
                      errorCode: response.errorCode || 0,
                      msg: response.errorMessage || ''
                    }
                    ajaxResponse('done', data)
                  }
                  //奥点接口
                  if (
                    responseURL.includes('aodianyun.com') &&
                    Number(response.code) !== 0
                  ) {
                    const data = {
                      origin: 'aodian',
                      status: xhr.status,
                      statusText: xhr.xhr.statusText || '',
                      method: xhr.args.method,
                      responseURL: xhr.args.url,
                      data: response.data || null,
                      code: response.code || 0,
                      msg: response.msg || ''
                    }
                    ajaxResponse('done', data)
                  }
                }
              }, 600)
            } catch (e) {
              // ignore
            }
          }
        },
        onerror: function(xhr) {
          if (xhr.args) {
            const responseURL = xhr.args.url ? xhr.args.url.split('?')[0] : ''
            if (
              opt.filterUrl.some(item => responseURL.includes(item)) ||
              !responseURL
            ) {
              return
            }
            const data = {
              method: xhr.args.method,
              responseURL: responseURL,
              statusText: 'xhr request error'
            }
            ajaxResponse('error', data)
          }
        },
        open: function(arg, xhr) {
          this.args = {
            url: arg[1].split('?')[0],
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
