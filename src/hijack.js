
var hijack = (function() {

  class Hijack {
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 09:09:12  
     * @Desc:   数据劫持构造函数
     * @Parm:   {Object} mvvm实例对象的data属性 
     */  
    constructor(data) {
      this.data = data
      this.hijack(data)
    }
  
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 20:31:40  
     * @Desc:   数据劫持
     * @Parm:   {Object} data mvvm实例对象的data属性 
     */  
    hijack(data) {
      for(let key of Object.keys(data)) {
        this.hijackKey(data, key, data[key])
      }
    }
  
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 20:31:40  
     * @Desc:   属性劫持
     * @Parm:   {Object} data mvvm实例对象的data属性
     *          {Any} key data对象的属性名
     *          {Any} val data对象的属性值
     */         
    hijackKey(data, key, val) {
      hijack(val)
      Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get() {
          console.log(`hijack get '${key}': `, val)
          return val
        },
        set(newVal) {
          if(newVal === val) return
          val = newVal
          console.log(`hijack set '${key}': `, val)
          // 如果新值是object, 则对其属性劫持
          hijack(newVal)
        }
      })
    }
  }

  return (data) => {
    if(!data || typeof data !== 'object') return
    return new Hijack(data)
  }
  
})()


