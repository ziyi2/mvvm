
let input = document.getElementById('input')
let div = document.getElementById('div')
let data = { input: '' }

hijack(data, input)

// model -> view
data.input = '11111111'

// view -> model
input.oninput = function(e) {
  // model -> view
 data.input = e.target.value
}

function hijack(data) {
  if(typeof data !== 'object') return
  for(let key of Object.keys(data)) {
    let val = data[key]
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get() {
        console.log('[hijack][get] -> val: ', val)
        // 和执行 return data[key] 有什么区别 ？
        return val
      },
      set(newVal) {
        if(newVal === val) return
        console.log('[hijack][set] -> newVal: ', newVal)
        val = newVal
        
        // 更新所有和data.input数据相关联的视图
        input.value = newVal
        div.innerHTML = newVal

        // 如果新值是object, 则对其属性劫持
        hijack(newVal)
      }
    })
  }
}
