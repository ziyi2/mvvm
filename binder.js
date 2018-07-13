
let binder = {}
mixin(binder, browser)

Object.assign(binder, {
  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 19:01:21  
   * @Desc:   判断是否是Node节点的绑定属性 
   * @Parm:   {String} attr Node节点的属性 
   */  
  isBind(attr) {
    return attr.includes('b-')
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 19:18:18  
   * @Desc:   判断绑定类型是否是事件类型 
   * @Parm:   {String} type 绑定类型 
   */  
  isEventBind(type) {
    return type.includes('on-')
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 19:26:39  
   * @Desc:   b-on:type 绑定事件处理
   * @Parm:   {Object} node Node节点
   *          {Object} vm MVVM实例对象
   *          {String} val 绑定值
   *          {String} type 绑定类型 
   */  
  eventHandler(node, vm, val, type) {
    let eventType = type.split('-')[1],
        fn = vm.$options.methods && vm.$options.methods[val]
    if(eventType && fn) {
      this.event.add(node, eventType, fn.bind(vm))    
    }
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 20:14:04  
   * @Desc:   b-value 绑定值处理
   * @Parm:   {Object} node Node节点
   *          {Object} vm MVVM实例对象
   *          {String} val 绑定值
   */  
  value(node, vm, val) {
    this.bind(node, vm, val, 'value')
  },


  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 20:17:12  
   * @Desc:   绑定处理 
   * @Parm:   {Object} node Node节点
   *          {Object} vm MVVM实例对象
   *          {String} val 绑定值 
   *          {String} type 绑定类型 
   */  
  bind(node, vm, val, type) {
    let update = this[`${type}Update`]
    console.log(type)
    update && update(node, vm.getDataValue(val))
  }


  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-13 09:22:01  
   * @Desc:   b-value 绑定值更新
   * @Parm:    
   */  
  // valueUpdate() {

  // }
})









