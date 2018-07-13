/** 
 * @Author: zhuxiankang 
 * @Date:   2018-07-13 08:57:24  
 * @Desc:   混合方法 
 * @Parm:   {Object} mixin 混入对象
 *          {Object} extend 被混入的对象  
 */
function mixin(extend, mixin) {
  // 指定特定的混入属性
  if(arguments[2]) {
    for(var i=2,len=arguments.length; i<len; i++) {
      if(!mixin[arguments[i]]) continue
      extend[arguments[i]] = mixin[arguments[i]]
    }
  // 混入全部
  } else {
    for(var key in mixin) {
      // 被混入对象存在同名属性则不混入
      if(!extend[key]) {
        extend[key] = mixin[key]
      }
    }
  }
}