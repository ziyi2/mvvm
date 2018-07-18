(function(window, browser){
  window.binder = {
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 19:01:21  
     * @Desc:   判断是否是Node节点的绑定属性 
     * @Parm:   {String} attr Node节点的属性 
     */  
    is(attr) {
      return attr.includes('b-')
    },
    
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 19:18:18  
     * @Desc:   判断绑定类型是否是事件类型 
     * @Parm:   {String} type 绑定类型 
     */  
    isEvent(type) {
      return type.includes('on-')
    },
    
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 19:26:39  
     * @Desc:   事件绑定处理(b-on-type)
     * @Parm:   {Object} node Node节点
     *          {Object} vm MVVM实例对象
     *          {String} method mvvm实例的method
     *          {String} type 绑定类型 
     */  
    event(node, vm, method, type) {
      let eventType = type.split('-')[1],
          fn = vm.options.methods && vm.options.methods[method]
      if(eventType && fn) {
        browser.event.add(node, eventType, fn.bind(vm))    
      }
    },
    
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 20:14:04  
     * @Desc:   值绑定处理(b-value)
     * @Parm:   {Object} node Node节点
     *          {Object} vm MVVM实例对象
     *          {String} key mvvm实例的data对象的属性名称
     */  
    value(node, vm, key) {
      this.bind(node, vm, key, 'value')
      // 数据双向绑定
      browser.event.add(node, 'input', (e) => {
        let newVal = browser.event.target(e).value
        // console.log(`[binder][value][input(event)] -> key: `, key)
        // console.log(`[binder][value][input(event)] -> newVal: `, newVal)
        vm.setData(key, newVal)
      })
    },
    

    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-15 14:23:30  
     * @Desc:   文本值绑定处理(b-text或{{}}模板)
     * @Parm:   {Object} node Node节点
     *          {Object} vm MVVM实例对象
     *          {String} key mvvm实例的data对象的属性名称
     */ 
    text(node, vm, key) {
      this.bind(node, vm, key, 'text')
    },


    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-16 08:56:35  
     * @Desc:   html文本处理(b-html) 
     * @Parm:   {Object} node Node节点
     *          {Object} vm MVVM实例对象
     *          {String} key mvvm实例的data对象的属性名称
     */    
    html(node, vm, key) {
      this.bind(node, vm, key, 'html')
    },

    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 20:17:12  
     * @Desc:   绑定处理(b-) 
     * @Parm:   {Object} node Node节点
     *          {Object} vm MVVM实例对象
     *          {String} key mvvm实例的data对象的属性名称
     *          {String} type 绑定类型 
     */  
    bind(node, vm, key, type) {
      let update = this.update[type]
      update && update(node, vm.getData(key))

      // 订阅数据劫持的数据变化信息，详见hijack(hijackKey)
      let keys = key.split('.')   
      let dataKey

      for(let k of keys) {
        dataKey = dataKey ? `${dataKey}.${k}` : k
        
        vm.mediator.sub(dataKey, function() {
          // console.log(`[binder][update][${type}] -> node: `, node)
          // console.log(`[binder][update][${type}] -> dataKey: `, dataKey)
          console.log('[mediator][sub] -> dataKey: ', dataKey)
          update && update(node, vm.getData(key))
        })
      }
    },
  
  
    update: {
      /** 
       * @Author: zhuxiankang 
       * @Date:   2018-07-15 11:01:38  
       * @Desc:   值绑定更新(b-value)
       * @Parm:   {Object} node Node节点
       *          {String} val 绑定值 
       */  
      value(node, val) {
        browser.val(node, val)
      },
      

      /** 
       * @Author: zhuxiankang 
       * @Date:   2018-07-15 11:01:38  
       * @Desc:   文本值绑定更新(b-text或{{}}模板)
       * @Parm:   {Object} node Node节点
       *          {String} val 绑定值 
       */ 
      text(node, val) {
        browser.text(node, val)
      },

      /** 
       * @Author: zhuxiankang 
       * @Date:   2018-07-16 08:59:32  
       * @Desc:   html文本更新(b-html)  
       * @Parm:   {Object} node Node节点
       *          {String} val 绑定值   
       */      
      html(node, val) {
        browser.html(node, val)
      }
    }
  }
})(window, browser)



