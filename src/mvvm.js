class MVVM {
  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:01:07  
   * @Desc:   mvvm实例构造函数 
   * @Parm:   {Object} options mvvm实例的参数 
   */  
  constructor(options = {}) {
    this.$options = options
    this.$data = this.$options.data
    this.proxyData(this.$data)
    this.$view = new View(options.el || document.body, this)
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
          this.$data[key] = newVal
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
  getDataValue(key) {
    let val = this
    let keys = key.split('.')
    for(let k of keys) {
      val = val[k]
    }
    return val
  }
}