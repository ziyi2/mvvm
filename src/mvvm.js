class Mvvm {
  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:01:07  
   * @Desc:   mvvm实例构造函数 
   * @Parm:   {Object} options mvvm实例的参数 
   */  
  constructor(options = {}) {
    this.options = options
    this.mediator = new Mediator()
    let data = this.data = this.options.data
    this.proxyData(data)
    this.hijack = hijack(data, this)
    this.view = new View(options.el || document.body, this)
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 20:45:50  
   * @Desc:   将data数据绑定到this, 从而可以使用this访问 
   * @Parm:   {Object} data 被代理的数据 
   */  
  proxyData(data) {
    for(let key of Object.keys(data)) {
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get() {
          return data[key]
        },
        set(newVal) {
          this.data[key] = newVal
        }
      })
    }
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 20:29:38  
   * @Desc:   获取data对象的某个属性值
   * @Parm:   {String} key data对象的属性
   */  
  getData(key) {
    let val = this
    let keys = key.split('.')
    for(let i=0, len=keys.length; i<len; i++) {
      val = val[keys[i]]
      if(!val && i !== len - 1) { throw new Error(`Cannot read property ${keys[i]} of undefined'`) }
    }
    // console.log('[mvvm][getData] -> val: ', val)
    return val
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-16 21:54:15  
   * @Desc:   获取data对象的某个属性值
   * @Parm:   {String} key data对象的属性
   *          {String} newVal 绑定值
   */  
  setData(key, newVal) {
    let val = this
    let keys = key.split('.')
    for(let i=0, len=keys.length; i<len; i++) {
      if(i < len - 1) {
        val = val[keys[i]]
      } else {
        val[keys[i]] = newVal
      }
    }
    // console.log('[mvvm][setData] -> val: ', val)
  }
}