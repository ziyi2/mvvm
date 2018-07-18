
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
      this.data = data
      this.hijack(data, dataKey)
    }
  
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 20:31:40  
     * @Desc:   数据劫持
     * @Parm:   {Object} data mvvm实例对象的data属性 
     *          {String} dataKey data对象的属性名标识
     */  
    hijack(data, dataKey) {
      for(let key of Object.keys(data)) {
        dataKey = dataKey ? `${dataKey}.${key}` : key
        console.log(dataKey)
        this.hijackKey(data, key, dataKey, data[key])
      }
    }
  
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 20:31:40  
     * @Desc:   属性劫持
     * @Parm:   {Object} data mvvm实例对象的data属性
     *          {Any} key data对象的属性名
     *          {Any} val data对象的属性值
     *          {String} dataKey data对象的属性名标识
     */         
    hijackKey(data, key, dataKey, val) {
      let { vm } = this
      hijack(val, vm, dataKey)
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
          vm.mediator.pub(key)
          // 如果新值是object, 则对其属性劫持
          hijack(newVal, vm, dataKey)
        }
      })
    }
  }

  return (data, vm, dataKey) => {
    if(!data || typeof data !== 'object') return
    return new Hijack(data, vm, dataKey)
  }
})()


