
class View {
  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:01:39  
   * @Desc:   view实例的构造函数 
   * @Parm:   {String/Node} el 选择器或node节点
   *          {Object} vm mvvm实例对象的this指向
   */  
  constructor(el, vm) {
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)

    if(this.$el) {
      this.$fragment = this.node2Fragment(this.$el)
    }

  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:08:28  
   * @Desc:   判断节点类型是否是Element节点
   * @Parm:   {Node} node节点
   */  
  isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:15:18  
   * @Desc:   将node节点转为文档碎片 
   * @Parm:   {Node} node节点 
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