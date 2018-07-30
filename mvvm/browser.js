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
     * @Date:   2018-07-13 08:38:07  
     * @Desc:   移除事件 
     * @Parm:   {Object} node 添加事件的节点
     *          {String} type 事件类型
     *          {Function} fn 句柄函数 
     */    
    remove(node, type, fn) {
      if(node.removeEventListener) {
        node.removeEventListener(type, fn, false)
      } else if(dom.detachEvent) {
        node.detachEvent(`on${type}`, fn)
      } else {
        node[`on${type}`] = null
      }
    },


    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-13 08:42:41  
     * @Desc:   获取事件对象 
     * @Parm:   {Object} event 事件对象 
     */    
    self(event) {
      return event || window.event
    },

    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-13 08:43:36  
     * @Desc:   获取事件的目标对象 
     * @Parm:   {Object} event 事件对象  
     */    
    target(event) {
      return event.target || event.srcElement
    },

    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-13 08:44:29  
     * @Desc:   取消事件的默认行为 
     * @Parm:   {Object} event 事件对象   
     */    
    preventDefault(event) {
      event.preventDefault 
      ? event.preventDefault() 
      : event.returnValue = false
    },

    /** 
     * @Author: zhuxiankang 
     * @Date:   2018-07-13 08:46:56  
     * @Desc:   取消事件的捕获或冒泡 
     * @Parm:   {Object} event 事件对象    
     */   
    stopPropagation(event) {
      event.stopPropagation 
      ? event.stopPropagation()
      : event.cancelBubble = true
    } 
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-13 08:48:28  
   * @Desc:   获取元素 
   * @Parm:   {String} selector 选择器 
   */  
  query(selector) {
    return document.querySelector(selector)
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
    console.log(`[browser][val] -> node: `, node)
    console.log(`[browser][val] -> val: `, val)
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-16 09:17:47  
   * @Desc:   Node节点的文本处理 
   * @Parm:   {Object} node Node节点
   *          {String} val 节点的文本 
   */  
  text(node, val) {
    node.textContent = val || ''
    console.log(`[browser][text] -> node: `, node)
    console.log(`[browser][text] -> val: `, val)
  },

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-16 09:12:32  
   * @Desc:   innerHTML处理
   * @Parm:   {Object} node Node节点  
   *          {String} val 填充的html片段
   */  
  html(node, val) {
    node.innerHTML = val || ''
    console.log(`[browser][html] -> node: `, node)
    console.log(`[browser][html] -> val: `, val)
  }
}