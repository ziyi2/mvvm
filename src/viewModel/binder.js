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



