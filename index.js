/**
 * @description 发布订阅模式
 */
(function () {
  const root = (typeof self === 'object' && self.self === self && self)
    || (typeof global === 'object' && global.global === global && global)
    || this
    || {}
  // 验证监听函数的合法性
  function isValidListener(listener) {
    if (typeof listener === 'function') {
      return true
    } else if (listener && typeof listener === 'object') {
      return isValidListener(listener.listener)
    } else {
      return false
    }
  }
  // 验证监听函数是否已经存在
  function indexOf (array, item) {
    let result = -1
    item = typeof item === 'object' ? item.listener : item
    for (let i = 0;i < array.length;i++) {
      if (array[i].listener === item) {
        result = i
        break
      }
    }
    return result
  }
  function eventEmitter() {
    this._events = {}
  }
  eventEmitter.VERSION = '1.0.0'
  let proto = eventEmitter.prototype
  /**
   * 添加函数
   * @param {String} eventName 事件名称
   * @param {Function} listener 监听器函数
   * @return {Object} 可链式调用
   */
  proto.on = function (eventName,listener) {
    if (!eventName || !listener) return
    if (!isValidListener(listener)) {
      throw new TypeError('listener must be a function')
    }
    let events = this._events
    let listeners = events[eventName] = events[eventName] || []
    let listenerIsWrapped = typeof listener === 'object'
    // 不重复添加事件
    if (indexOf(listeners, listener) === -1) {
      listeners.push(listenerIsWrapped ? listener : {
        listener: listener,
        once: false
      })
    }
    return this
  }
  /**
   * 触发事件
   * @param {String} eventName 事件名称
   * @param {Array} args 传入监听器函数的参数，使用数组形式传入
   * @return {Object} 可链式调用
   */
  proto.emit = function (eventName, args) {
    let listeners = this._events[eventName]
    if (!listeners) return
    for (let i = 0;i < listeners.length;i++) {
      let listener = listeners[i]
      if (listener) {
        listener.listener.apply(this, args || [])
        listener.once && this.off(eventName, listener.listener)
      }
    }
    return this
  }
  /**
   * 添加事件，该事件只能被执行一次
   * @param {String} eventName 事件名称
   * @param {Function} listener 监听器函数
   * @return {Object} 可链式调用
   */
  proto.once = function (eventName, listener) {
    return this.on(eventName, {
      listener: listener,
      once: true
    })
  }
  /**
   * 删除事件
   * @param {String} eventName 事件名称
   * @param {Function} listener 监听器函数
   * @return {Object} 可链式调用
   */
  proto.off = function (eventName, listener) {
    let listeners = this._events[eventName]
    if (!listeners) return
    let index
    for (let i = 0;i < listeners.length;i++) {
      if (listeners[i] && listeners[i].listener === listener) {
        index = i
        break
      }
    }
    if (typeof index === 'undefined') {
      listeners.splice(index,1)
    }
    return this
  }
  /**
   * 删除所有事件或者删除一个类型的所有事件
   * @param {String} eventName 事件名称
   */
  proto.allOff = function (eventName) {
    if (eventName && this._events[eventName]) {
      this._events[eventName] = {}
    } else {
      this._events = {}
    }
  }
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
        exports = module.exports = eventEmitter; // node环境
    }
    exports.eventEmitter = eventEmitter;
} else {
    root.eventEmitter = eventEmitter; // 浏览器
}
})()