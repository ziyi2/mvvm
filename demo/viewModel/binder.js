(function(window, browser){
  window.binder = {
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 19:01:21  
     * @Desc:   判断是否是绑定属性 
     * @Parm:   {String} attr Node节点的属性 
     */  
    is(attr) {
      return attr.includes('b-')
    },

    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 20:14:04  
     * @Desc:   解析绑定指令
     * @Parm:   {Object} attr html属性对象
     *          {Object} node Node节点
     *          {Object} model 数据
     *          {Object} mediator 中介者
     */  
    parse(node, attr, model, mediator) {
      if(!this.is(attr.name)) return

      this.model = model 

      this.mediator = mediator

      let bindValue = attr.value,
          bindType = attr.name.substring(2)

      // 绑定视图指令处理
      this[bindType](node, bindValue.trim())
    },
    
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 20:14:04  
     * @Desc:   值绑定处理(b-value)
     * @Parm:   {Object} node Node节点
     *          {String} key model的属性
     */  
    value(node, key) {
      this.update(node, key)
      
      // 数据双向绑定
      browser.event.add(node, 'input', (e) => {
        // 更新model和model对应的视图
        let newVal = browser.event.target(e).value
        // 设置对应的数据
        this.model.setData(key, newVal)
      })

      // 订阅数据变化更新视图(闭包)
      this.mediator.sub(key, () => {
        console.log('[mediator][sub] -> key: ', key)
        console.log('[mediator][sub] -> node: ', node)
        this.update(node, key)
      })
    },
    
   
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-12 20:17:12  
     * @Desc:   值绑定更新(b-value)
     * @Parm:   {Object} node Node节点
     *          {String} key model的属性
     */  
    update(node, key) {
      browser.val(node, this.model.getData(key))
    }
  }
})(window, browser)



