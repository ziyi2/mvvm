
let binder = {
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
    return type.includes('on')
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 19:26:39  
   * @Desc:   b-on:type 绑定事件处理
   * @Parm:   {Object} node Node节点
   *          {Object} vm MVVM实例对象
   *          {String} bindValue 绑定值
   *          {String} bindType 绑定类型 
   */  
  eventHandler(node, vm, bindValue, bindType) {
    let eventType = bindType.split(':')[1],
        fn = vm.$options.methods && vm.$options.methods[bindValue]
    if(eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)    
    }
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 20:14:04  
   * @Desc:   b-value 绑定值处理
   * @Parm:   {Object} node Node节点
   *          {Object} vm MVVM实例对象
   *          {String} bindValue 绑定值
   */  
  value(node, vm, bindValue) {
    this.bind(node, vm, bindValue, 'value')
  },


  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 20:17:12  
   * @Desc:   绑定处理 
   * @Parm:   {Object} node Node节点
   *          {Object} vm MVVM实例对象
   *          {String} bindValue 绑定值 
   */  
  bind(node, vm, bindValue, bindType) {
    let update = this.update[bindType]
    update && update(node, vm.getDataValue(bindValue))
  },




  // 绑定更新对象
  update: {
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 20:23:50  
     * @Desc:   b-value 绑定值更新 
     * @Parm:   {Object} node Node节点
     *          {String} value Node节点的值 
     */    
    value(node, value) {

    }
  }
}