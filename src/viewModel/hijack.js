
var hijack = (function() {

  class Hijack {
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 09:09:12  
     * @Desc:   数据劫持构造函数
     * @Parm:   {Object} model 数据 
     *          {Object} mediator 发布订阅对象 
     */  
    constructor(model, mediator) {
      this.model = model
      this.mediator = mediator
    }
  
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-17 20:31:40  
     * @Desc:   model数据劫持
     * @Parm:   
     *          
     */  
    hijackData() {

      let { model, mediator } = this

      for(let key of Object.keys(model)) {

        let val = model[key]

        Object.defineProperty(model, key, {
          enumerable: true,
          configurable: false,
          get() {
            // console.log('[hijack][get] -> dataKey: ', dataKey)
            // console.log('[hijack][get] -> val: ', val)
            return val
          },
          set(newVal) {
            if(newVal === val) return
            console.log('[hijack][set] -> key: ', key)
            console.log('[hijack][set] -> val: ', val)
            console.log('[hijack][set] -> newVal: ', newVal)
            val = newVal
            // 发布数据劫持的数据变化信息
            console.log('[mediator][pub] -> key: ', key)
            mediator.pub(key)
          }
        })
      }
    }
  }

  return (model, mediator) => {
    if(!model || typeof model !== 'object') return
    new Hijack(model, mediator).hijackData()
  }
})()


