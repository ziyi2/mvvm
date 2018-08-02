
let hijack = (data) => {
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
        // 如果新值是object, 则对其属性劫持
        hijack(newVal)
      }
    })
  }
}

let person = { name: 'ziyi2', age: 1 }
hijack(person)
// [hijack][get] -> val:  ziyi2
person.name
// [hijack][get] -> val:  1
person.age
// [hijack][set] -> newVal:  ziyi
person.name = 'ziyi'

// 属性类型变化劫持
// [hijack][get] -> val:  { familyName:"ziyi2", givenName:"xiankang" }
person.name = { familyName: 'zhu',  givenName: 'xiankang' }
// [hijack][get] -> val:  ziyi2
person.name.familyName = 'ziyi2'

// 数据属性
let job = { type: 'javascript' }
console.log(Object.getOwnPropertyDescriptor(job, "type"))
// 访问器属性
console.log(Object.getOwnPropertyDescriptor(person, "name"))

