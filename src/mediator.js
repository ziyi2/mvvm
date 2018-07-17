class Mediator {
  constructor() {
    this.data = {}
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-11 10:34:33  
   * @Desc:   订阅data对象的劫持变化
   * @Parm:   {String} key data属性
   *          {Function} cb 回调函数 
   */  
  sub(key, cb) {
    let { data } = this
    if(data[key]) return
    data[key] = cb
    return key
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-11 10:35:15  
   * @Desc:   发布data对象的劫持变化
   * @Parm:   {String} key data属性
   *          {Any} data 数据 
   */  
  pub(key, data) {
    let dataKey = this.data[key]
    if(!dataKey) return
    dataKey.call(this, data)
    return key
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-11 11:56:06  
   * @Desc:   取消订阅  
   * @Parm:   {String} key data属性 
   */  
  cancel(key) {
    let { data } = this
    for(let dataKey of Object.keys(data)) {
      if(dataKey === key) {
        delete data[key]
        break
      }
    }
  }
}
