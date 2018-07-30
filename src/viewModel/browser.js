let browser = {
  event: {
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-13 08:37:10  
     * @Desc:   添加事件 
     * @Parm:   {Object} node 添加事件的节点
     *          {String} type 事件类型
     *          {Function} fn 句柄函数 
     */    
    add(node, type, fn) {
      // DOM2
      if(node.addEventListener) {
        node.addEventListener(type, fn, false)
      // IE
      } else if(dom.attachEvent) {
        node.attachEvent(`on${type}`, fn)
      // DOM0  
      } else {
        node[`on${type}`] = fn
      }
    },
    
    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-13 08:43:36  
     * @Desc:   获取事件的目标对象 
     * @Parm:   {Object} event 事件对象  
     */    
    target(event) {
      return event.target || event.srcElement
    }
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-16 09:13:54  
   * @Desc:   Node节点的value处理 
   * @Parm:   {Object} node Node节点   
   *          {String} val 节点的值
   */  
  val(node, val) {
    node.value = val || ''
    console.log(`[browser][val] -> val: `, val)
  }
}