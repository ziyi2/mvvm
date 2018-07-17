class Hijack {
  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-17 09:09:12  
   * @Desc:   数据劫持构造函数
   * @Parm:   {Object} mvvm实例对象的data属性 
   */  
  constructor(data) {
    this.data = data
    this.hijack(data)
  }

  hijack() {

  }
}