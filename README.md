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

> 可以通过浏览器调试[中介者模式的demo源码](https://github.com/ziyi2/mvvm/tree/master/demo/mediator)查看打印信息。


### 数据劫持和数据双向绑定

#### 数据劫持

#### 数据双向绑定




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

