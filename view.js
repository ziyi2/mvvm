
class View {
  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:01:39  
   * @Desc:   view实例的构造函数 
   * @Parm:   {String/Node} el 选择器或node节点
   *          {Object} vm mvvm实例对象
   */  
  constructor(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if(this.$el) {
      // 将已有的DOM元素转成文档碎片
      this.$fragment = this.node2Fragment(this.$el)
      // 解析文档碎片
      this.parseFragment(this.$fragment)
    }
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 17:09:25  
   * @Desc:   解析文档碎片 
   * @Parm:   {Object} fragment 文档碎片 
   */  
  parseFragment(fragment) {
    let nodes = [].slice.call(fragment.childNodes)
    for(let node of nodes) {
      // let text = child.textContent
      // // 过滤空白文本
      // if(!text || !text.trim().length) continue

      if(this.isElementNode(node)) {
        this.parseNodeBind(node)
      }
      
    }
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 18:46:43  
   * @Desc:   解析Node节点的绑定属性
   * @Parm:   {Object} node Node节点 
   */  
  parseNodeBind(node) {
    let nodeAttrs = node.attributes
    for(let attr of nodeAttrs) {
      if(!binder.isBind(attr.name)) continue
      let bindValue = attr.value,
          bindType = attr.name.substring(2)
      binder.isEventBind(bindType) 
      ? binder.eventHandler(node, this.$vm, bindValue, bindType)
      : binder[bindType] && binder[bindType](node, this.$vm, bindValue)
    }
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:08:28  
   * @Desc:   判断节点类型是否是Element节点
   * @Parm:   {Object} node Node节点
   */  
  isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:15:18  
   * @Desc:   将node节点转为文档碎片 
   * @Parm:   {Object} node Node节点 
   */  
  node2Fragment(node) {
    let fragment = document.createDocumentFragment(),
        child;
    while(child = node.firstChild) {
      // 注意，给文档碎片添加一个节点，该节点会自动从node中删除
      fragment.appendChild(child)
    }    
    return fragment
  }
}