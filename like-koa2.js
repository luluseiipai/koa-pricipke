const http = require('http')

// 组合中间件
function compose(middlewareList) {
  return function(ctx) {
    // 中间件调用
    function dispatch(i) {
      const fn = middlewareList[i]
      try {
        return Promise.resolve(fn(ctx, this.dispatch.bind(null, ++i))) // 保证返回 Promise，防止漏写 async
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}

class LikeKoa2 {
  constructor() {
    this.middlewareList = []
  }

  use(fn) {
    this.middlewareList.push(fn)
    return this
  }

  createContext(req, res) {
    const ctx = {
      req,
      res
    }
    ctx.query = req.query
    return ctx
  }

  handleRequest(ctx, fn) {
    return fn(ctx)
  }

  callback() {
    const fn = compose(this.middlewareList)
    return (req, res) => {
      const ctx = this.createContext(req, res)
      return this.handleRequest(ctx, fn)
    }
  }
  
  listen(...args) {
    const server = http.createServer(this.callback())
  }
}

module.exports = LikeKoa2
