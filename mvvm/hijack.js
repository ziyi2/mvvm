
var hijack = (function() {

  class Hijack {
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 09:09:12  
     * @Desc:   数据劫持构造函数
     * @Parm:   {Object} mvvm实例对象的data属性 
     *          {Object} vm mvvm实例对象
     *          {String} dataKey data对象的属性名标识
     */  
    constructor(data, vm, dataKey) {
      this.vm = vm
      this.dataKey = dataKey
      this.data = data
      this.hijackData()
    }
  
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 20:31:40  
     * @Desc:   data对象的数据劫持
     * @Parm:   
     *          
     */  
    hijackData() {
      let { data, dataKey } = this
      for(let key of Object.keys(data)) {
        this.dataKey = dataKey ? `${dataKey}.${key}` : key
        this.hijackKey(key, data[key])
      }
    }
  
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 20:31:40  
     * @Desc:   data对象的属性的数据劫持
     * @Parm:   {Any} key data对象的属性名
     *          {Any} val data对象的属性值
     */         
    hijackKey(key, val) {
      let { vm, data, dataKey } = this
      let me = this
    
      this.hijack(val)

      Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get() {
          // console.log('[hijack][get] -> dataKey: ', dataKey)
          // console.log('[hijack][get] -> val: ', val)
          return val
        },
        set(newVal) {
          if(newVal === val) return
          // console.log('[hijack][set] -> dataKey: ', dataKey)
          // console.log('[hijack][set] -> val: ', val)
          // console.log('[hijack][set] -> newVal: ', newVal)
          val = newVal
          // 发布数据劫持的数据变化信息，详见binder(bind)
          console.log('[mediator][pub] -> dataKey: ', dataKey)
          vm.mediator.pub(dataKey)
          // 如果新值是object, 则对其属性劫持
          me.hijack(newVal)
        }
      })
    }
    
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-18 20:00:34  
     * @Desc:   子属性如果是对象，则继续进行数据劫持 
     * @Parm:    
     */    
    hijack(val) {
      if(!this.data || typeof this.data !== 'object') return
      hijack(val, this.vm, this.dataKey)
    }
  }

  return (data, vm, dataKey) => {
    if(!data || typeof data !== 'object') return
    return new Hijack(data, vm, dataKey)
  }
})()


