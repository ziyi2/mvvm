# mvvm

> 本文可以帮助你做什么？
>- 了解MV*架构设计模式的演变历史
>- 了解观察者模式和发布/订阅模式
>- 讲解mvvm的设计和实现过程


## mvvm示例

> 本示例的代码采用[es6语法](https://ziyi2.github.io/2017/09/13/Es6%E5%88%9D%E6%8E%A2.html#more)进行设计，包括browser.js(view视图的更新)、mediator.js(中介者)、binder.js(数据双向绑定器)、view.js(视图)、hijack.js(数据劫持)以及mvvm.js(mvvm实现)。本示例相关的代码可查看github的[ziyi2/mvvm](https://github.com/ziyi2/mvvm)。

``` javascript
<div id="app">
 <input type="text" b-value="input.message" b-on-input="handlerInput">
 <div>{{ input.message }}</div>
 <div b-text="text"></div>
 <div>{{ text }}</div>
 <div b-html="htmlMessage"></div>
</div>

<script src="./browser.js"></script>
<script src="./mediator.js"></script>
<script src="./binder.js"></script>
<script src="./view.js"></script>
<script src="./hijack.js"></script>
<script src="./mvvm.js"></script>


<script>
 let vm = new Mvvm({
    el: '#app',
    data: {
      input: {
        message: 'Hello Input!'
      },
      text: 'ziyi2',
      htmlMessage: `<button>提交</button>`
    },
    methods: {
      handlerInput(e) {
        this.text = e.target.value
      }
    }
  })
</script>
```

![mvvm](http://onh40c6zw.bkt.clouddn.com/mvvm.gif?imageView2/1/w/400/h/200/format/gif/q/1|imageslim)

## 了解MV*架构设计模式的演变历史

如果对于MVC、MVP和MVVM的架构设计模式不熟，建议首先阅读[MV*架构设计模式的演变历史](https://github.com/ziyi2/mvvm/blob/master/doc/history.md)。

## 了解观察者模式和发布/订阅模式

如果对于设计模式不熟，建议首先阅读[观察者模式和发布/订阅模式](https://github.com/ziyi2/mvvm/blob/master/doc/mode.md)。


## 讲解mvvm的设计和实现过程

> - mvvm的结构设计
> - [中介者模式](https://github.com/ziyi2/mvvm/tree/master/demo/mediator)
> - [数据劫持](https://github.com/ziyi2/mvvm/tree/master/demo/hijack)和[数据双向绑定](https://github.com/ziyi2/mvvm/tree/master/demo/dataBinder)
> - viewModel的实现
> - mvvm实现

接下来将按照以上顺序一步步讲解mvvm的实现过程，首先会讲解总体的结构设计，然后从一个个实现的小demo讲解最终的实现过程，帮助读者逐步理解mvvm的设计过程。

### mvvm的结构设计

<img  width="800px" src="http://onh40c6zw.bkt.clouddn.com/%5Bmvvm%5Dmvvm_design.png"/>

> 图中黄色区域和hijack(数据访问器)是Model部分，绿色区域View、binder以及browser是ViewModel部分，视图是View部分，发布/订阅模式用于Model和ViewModel之间的通信，整个构成mvvm模式。

图中的橙色线路主要的功能是实现 Mode -> ViewModel -> View ：

- 1）数据劫持定义：对mvvm实例跟视图相关的数据进行数据监听（数据发生变化的时候可以通过发布/订阅模式通知binder绑定器更新视图）。
- 2）视图指令解析：对mvvm实例所关联的dom元素转化成文档碎片并进行绑定指令解析（b-value、b-text、b-html等）。
- 3）绑定视图指令：对view解析绑定指令后的文档碎片进行更新视图处理（将b-value等指令转化为dom最终渲染的视图）。
- 4）添加数据订阅和用户输入监听事件：订阅mvvm实例的数据变化（用于更新视图），监听视图的用户输入事件（重新设置mvvm实例的数据）。

图中蓝色线路主要的功能是实现 view -> viewModel -> Model -> ViewModel -> View（数据双向绑定）

- 1）监听用户输入事件：对用户的输入input事件进行监听。
- 2）用户输入的数据处理：调用mvvm的数据设置方法，设置用户输入的数据。
- 3）数据劫持：监听mvvm的数据变化。
- 4） 发布数据变化：发布mvvm对应的数据变化（发布之后会被订阅器接收，从而又可以更新数据对应的其他视图变化，注意不包括1）中的用户输入对应的元素。

> Model -> ViewModel -> View 可以通过手动设置mvvm的数据从而执行3）和4）。

### 中介者模式

最简单的中介者模式只需要实现发布、订阅和取消订阅的功能。同时发布和订阅之间通过事件通道（channels）进行信息传递，可以避免观察者模式中产生依赖的情况。中介者模式的代码如下：

``` javascript
class Mediator {
  constructor() {
    this.channels = {}
    this.uid = 0
  }

  /** 
   * @Desc:   订阅频道
   * @Parm:   {String} channel 频道
   *          {Function} cb 回调函数 
   */  
  sub(channel, cb) {
    let { channels } = this
    if(!channels[channel]) channels[channel] = []
    this.uid ++ 
    channels[channel].push({
      context: this,
      uid: this.uid,
      cb
    })
    console.log('[mediator][sub] -> this.channels: ', this.channels)
    return this.uid
  }

  /** 
   * @Desc:   发布频道 
   * @Parm:   {String} channel 频道
   *          {Any} data 数据 
   */  
  pub(channel, data) {
    console.log('[mediator][pub] -> chanel: ', channel)
    let ch = this.channels[channel]
    if(!ch) return false
    let len = ch.length
    // 后订阅先触发
    while(len --) {
      ch[len].cb.call(ch[len].context, data)
    }
    return this
  }

  /** 
   * @Desc:   取消订阅  
   * @Parm:   {String} uid 订阅标识 
   */  
  cancel(uid) {
    let { channels } = this
    for(let channel of Object.keys(channels)) {
      let ch = channels[channel]
      if(ch.length === 1 && ch[0].uid === uid) {
        delete channels[channel]
        console.log('[mediator][cancel][delete] -> chanel: ', channel)
        console.log('[mediator][cancel] -> chanels: ', channels)
        return
      }
      for(let i=0,len=ch.length; i<len; i++) {
          if(ch[i].uid === uid) {
            ch.splice(i,1)
            console.log('[mediator][cancel][splice] -> chanel: ', channel)
            console.log('[mediator][cancel] -> chanels: ', channels)
            return
          }
      }
    }
  }
}
```

在每一个mvvm实例中，都需要实例化一个中介者实例对象，中介者实例对象的使用方法如下：

``` javascript
let mediator = new Mediator()
// 订阅channel1
let channel1First = mediator.sub('channel1', (data) => {
  console.log('[mediator][channel1First][callback] -> data', data)
})
// 再次订阅channel1
let channel1Second = mediator.sub('channel1', (data) => {
  console.log('[mediator][channel1Second][callback] -> data', data)
})
// 订阅channel2
let channel2 = mediator.sub('channel2', (data) => {
  console.log('[mediator][channel2][callback] -> data', data)
})
// 发布(广播)channel1,此时订阅channel1的两个回调函数会连续执行
mediator.pub('channel1', { name: 'ziyi1' })
// 发布(广播)channel2，此时订阅channel2的回调函数执行
mediator.pub('channel2', { name: 'ziyi2' })
// 取消channel1标识为channel1Second的订阅
mediator.cancel(channel1Second)
// 此时只会执行channel1中标识为channel1First的回调函数
mediator.pub('channel1', { name: 'ziyi1' })
```

> [中介者模式的demo源码](https://github.com/ziyi2/mvvm/tree/master/demo/mediator)。


### 数据劫持和数据双向绑定

#### 数据劫持

##### 对象的属性

对象的属性可分为数据属性（特性包括[[Value]]、[[Writable]]、[[Enumerable]]、[[Configurable]]）和存储器/访问器属性（特性包括[[ Get ]]、[[ Set ]]、[[Enumerable]]、[[Configurable]]），对象的属性只能是数据属性或访问器属性的其中一种。

属性的特性的含义

- [[Configurable]]: 表示能否通过 delete 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为访问器属性。
- [[Enumerable]]: 表示能否通过 for-in 循环返回属性。
- [[Value]]: 包含这个属性的值。读取属性值的时候，从这个位置读；写入属性值的时候，把新值保存在这个位置。这个特性的默认值为 undefined。
- [Writable]]: 表示能否修改属性的值。
- [[ Get ]]: 在读取属性时调用的函数。默认值为 undefined。
- [[ Set ]]: 在写入属性时调用的函数。默认值为 undefined。

> 数据劫持就是使用了[[ Get ]]和[[ Set ]]的特性，在访问对象的属性和写入对象的属性时能够自动触发属性特性的调用函数，从而做到监听数据变化的目的。


对象的属性可以通过ES5的设置特性方法Object.defineProperty(data, key, descriptor)改变属性的特性，其中descriptor传入的就是以上所描述的特性集合。

##### 实现数据监听

有了对象的访问器属性的[[ Get ]]和[[ Set ]]特性,就可以实现数据监听：

``` javascript

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
```

> [数据劫持的demo源码](https://github.com/ziyi2/mvvm/tree/master/demo/hijack)。


#### 数据双向绑定

数据双向绑定主要包括数据的变化引起视图的变化（View -> 用户输入监听事件 -> Model）、视图的变化又改变数据（Model -> 监听数据变化 -> Model），从而实现数据和视图之间的强联系。

在实现了数据监听的基础上，加上用户输入事件以及视图更新，就可以简单实现数据的双向绑定

``` javascript

<input id="input" type="text">
<div id="div"></div>

// 监听数据变化
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

let input = document.getElementById('input')
let div = document.getElementById('div')

// model
let data = { input: '' }

// 数据劫持
hijack(data, input)

// model -> view
data.input = '11111112221'

// view -> model
input.oninput = function(e) {
  // model -> view
  data.input = e.target.value
}
```
> [数据双向绑定的demo源码](https://github.com/ziyi2/mvvm/tree/master/demo/dataBinder)


## 设计模式

> 本示例使用了哪些[设计模式](https://ziyi2.github.io/2018/07/15/js%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.html#more)？
>-  [外观模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#facade%E5%A4%96%E8%A7%82%E6%A8%A1%E5%BC%8F)
>-  [构造器模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#constructor%E6%9E%84%E9%80%A0%E5%99%A8%E6%A8%A1%E5%BC%8F)
>-  [模块模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#module%E6%A8%A1%E5%9D%97%E6%A8%A1%E5%BC%8F)
>-  [中介者模式（发布/订阅模式）](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#mediator%E4%B8%AD%E4%BB%8B%E8%80%85%E6%A8%A1%E5%BC%8F)
>- [原型模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#prototype%E5%8E%9F%E5%9E%8B%E6%A8%A1%E5%BC%8F)
>- [命令模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#command%E5%91%BD%E4%BB%A4%E6%A8%A1%E5%BC%8F)
>- [建造者模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#%E5%BB%BA%E9%80%A0%E8%80%85%E6%A8%A1%E5%BC%8F)
>- [mvvm模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#mvvm)

## References
- [DMQ/mvvm](https://github.com/DMQ/mvvm)
- [Scaling Isomorphic Javascript Code](https://blog.nodejitsu.com/scaling-isomorphic-javascript-code/)
- [Understanding JavaServer Pages Model 2 architecture](https://www.javaworld.com/article/2076557/java-web-development/understanding-javaserver-pages-model-2-architecture.html)
- [GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)
- [界面之下：还原真实的MV*模式](https://github.com/livoras/blog/issues/11)

