
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
        console.log('4444', this.dataKey)
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
      console.log('555', dataKey)

      this.hijack(val)

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
          console.log(`hijack set data: `,  data)
          // 发布数据劫持的数据变化信息，详见binder(bind)
          console.log('222', dataKey)
          vm.mediator.pub(dataKey)
          // 如果新值是object, 则对其属性劫持
          if(val && typeof val === 'object') {
            this.hijack(newVal)
          }
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


