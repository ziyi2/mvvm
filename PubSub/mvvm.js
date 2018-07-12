class MVVM {
  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-12 09:01:07  
   * @Desc:   mvvm实例构造函数 
   * @Parm:   {Object} options mvvm实例的参数 
   */  
  constructor(options = {}) {
    this.$options = options
    this._data = this.$options.data
    // 视图
    this.$view = new View(options.el || document.body, this)
  }
}