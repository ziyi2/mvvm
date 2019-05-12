# 基于Vue的简易MVVM实现

本文可以帮助你了解什么？

- 了解MV*架构设计模式的演变历史
- 了解观察者设计模式
- 了解Vue的运行机制
- 了解基于Vue的简易MVVM实现过程

> 需要注意阅读有风险，因为本文又臭又长......

## MV*设计模式的演变历史

我们先来花点时间想想，如果你是一个前端三贱客（Vue、React或者Angular）的开发者，你是有多么频繁的听到“MVVM”这个词，但你真正明白它的含义吗？


### Web前端的演变历史

从单纯的HTML静态页面到MVVM模式的成熟应用，自我能感受的Web前端模式粗略的发展如下所示（可能顺序不是很严谨）：

- HTML
- CGI（Common Gateway Interface）、SSI（Server Side Includes）
- JavaScript
- ASP（Active Serve Pages）、JSP（Java Serve Pages）
- JQuery
- Node.js、EJS、JADE
- MVC
- MVP
- MVVM - 包括服务端渲染


> CGI和SSI分别是早期服务端的HTML渲染器和模板引擎，学生时期在嵌入式STM32芯片上利用lwIP（小型开源的TCP/IP协议栈）和FreeRTOS（轻量级操作系统）搭建了一个嵌入式Web服务器，如果您感兴趣，可以在中国知网查看我写的小论文[基于嵌入式Web服务器的停车场管理系统](http://www.cnki.com.cn/Article/CJFDTotal-ZJGD201604007.htm)，那也是我从嵌入式转向Web前端的转折点，啊哈哈哈，有点扯远了...


### MV*设计模式的起源


起初**计算机科学家（现在的我们是小菜鸡）**在设计GUI（图形用户界面）应用程序的时候，代码是杂乱无章的，通常难以管理和维护。GUI的设计结构一般包括**视图**（View）、**模型**（Model）、**逻辑**（Application Logic、Business Logic以及Sync Logic），例如：

- 用户在**视图**（View）上的键盘、鼠标等行为执行**应用逻辑**（Application Logic），**应用逻辑**会触发**业务逻辑**（Business Logic），从而变更**模型**（Model）
- **模型**（Model）变更后需要**同步逻辑**（Sync Logic）将变化反馈到**视图**（View）上供用户感知

可以发现在GUI中**视图**和**模型**是天然可以进行分层的，杂乱无章的部分主要是**逻辑**。于是我们的程序员们不断的绞尽脑汁在想办法优化GUI设计的**逻辑**，然后就出现了MVC、MVP以及MVVM等设计模式。

### MV*设计模式在B/S架构中的思考

在B/S架构的应用开发中，MV*设计模式概述并封装了应用程序及其环境中需要关注的地方，尽管JavaScript已经变成一门同构语言，但是在浏览器和服务器之间这些关注点可能不一样：

- 视图能否跨案例或场景使用？
- 业务逻辑应该放在哪里处理？（在**Model**中还是**Controller**中）
- 应用的状态应该如何持久化和访问？


### MVC（Model-View-Controller）

早在上个世纪70年代，美国的施乐公司（Xerox）的工程师研发了Smalltalk编程语言，并且开始用它编写GUI。而在Smalltalk-80版本的时候，一位叫Trygve Reenskaug的工程师设计了MVC的架构模式，极大地降低了GUI的管理难度。


![MVC](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/mvc.png)


如图所示，MVC把GUI分成**View**（视图）、**Model**（模型）、**Controller**（控制
器）（可热插拔，主要进行**Model**和**View**之间的协作，包括路由、输入预处理等业务逻辑）三个模块：

- **View**：检测用户的键盘、鼠标等行为，传递调用**Controller**执行应用逻辑。**View**更新需要重新获取**Model**的数据。
- **Controller**：**View**和**Model**之间协作的应用逻辑或业务逻辑处理。
- **Model**：**Model**变更后，通过观察者模式通知**View**更新视图。

> **Model**的更新通过观察者模式，可以实现多视图共享同一个**Model**。


传统的MVC设计对于Web前端开发而言是一种十分有利的模式，因为**View**是持续性的，并且**View**可以对应不同的**Model**。[Backbone.js](https://backbonejs.org/)就是一种稍微变种的MVC模式实现（和经典MVC较大的区别在于**View**可以直接操作**Model**，因此这个模式不能同构）。这里总结一下MVC设计模式可能带来的好处以及不够完美的地方：

优点：
- 职责分离：模块化程度高、**Controller**可替换、可复用性、可扩展性强。
- 多视图更新：使用观察者模式可以做到单**Model**通知多视图实现数据更新。

缺点：
- 测试困难：**View**需要UI环境，因此依赖**View**的**Controller**测试相对比较困难（现在Web前端的很多测试框架都已经解决了该问题）。
- 依赖强烈：**View**强依赖**Model**(特定业务场景)，因此**View**无法组件化设计。


####服务端MVC

经典MVC只用于解决GUI问题，但是随着B/S架构的不断发展，Web服务端也衍生出了MVC设计模式。


##### JSP Model1和JSP Model2的演变过程

JSP Model1是早期的Java动态Web应用技术，它的结构如下所示：

![JSP Model1](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/JSP%20Model1.png)

在Model1中，**JSP**同时包含了**Controller**和**View**，而**JavaBean**包含了**Controller**和**Model**，模块的职责相对混乱。在JSP Model1的基础上，Govind Seshadri借鉴了MVC设计模式提出了JSP Model2模式（具体可查看文章[Understanding JavaServer Pages Model 2 architecture](https://www.javaworld.com/article/2076557/understanding-javaserver-pages-model-2-architecture.html)），它的结构如下所示：


![JSP Model2](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/JSP%20Model2.png)


在JSP Model2中，**Controller**、**View**和**Model**分工明确，**Model**的数据变更，通常通过**JavaBean**修改**View**然后进行前端实时渲染，这样从Web前端发起请求到数据回显路线非常明确。不过这里专门询问了相应的后端开发人员，也可能通过**JavaBean**到**Controller**（**Controller**主要识别当前数据对应的JSP）再到**JSP**，因此在服务端MVC中，也可能产生这样的流程**View** -> **Controller** -> **Model** -> **Controller** -> **View**。


> 在JSP Model2模式中，没有做到前后端分离，前端的开发大大受到了限制。

##### Model2的衍生

![Model2](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/model2_mvc.png)

对于Web前端开发而言，最直观的感受就是在Node服务中衍生Model2模式（例如结合Express以及EJS模板引擎等）。



##### 服务端MVC和经典MVC的区别

在服务端的MVC模式设计中采用了HTTP协议通信（HTTP是单工无状态协议），因此**View**在不同的请求中都不保持状态（状态的保持需要额外通过Cookie存储），并且经典MVC中**Model**通过观察者模式告知**View**的环节被破坏（例如难以实现服务端推送）。当然在经典MVC中，**Controller**需要监听**View**并对输入做出反应，逻辑会变得很繁重，而在Model2中，	**Controller**只关注路由处理等，而**Model**则更多的处理业务逻辑。



### MVP（Model-View-Presenter)

在上个世纪90年代，IBM旗下的子公司Taligent在用C/C++开发一个叫CommonPoint的图形界面应用系统的时候提出了MVP的概念。


![MVP](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/mvp.png)


如上图所示，MVP是MVC的模式的一种改良，打破了**View**对于**Model**的依赖，其余的依赖关系和MVC保持不变。


- **Passive View**：**View**不再处理同步逻辑，对**Presenter**提供接口调用。由于不再依赖**Model**，可以让**View**从特定的业务场景中抽离，完全可以做到组件化。
- **Presenter**（**Supervising Controller**）：和经典MVC的**Controller**相比，任务更加繁重，不仅要处理应用业务逻辑，还要处理同步逻辑(高层次复杂的UI操作)。
- **Model**：**Model**变更后，通过观察者模式通知**Presenter**，如果有视图更新，**Presenter**又可能调用**View**的接口更新视图。


MVP模式可能产生的优缺点如下：

- **Presenter**便于测试、**View**可组件化设计
- **Presenter**厚、维护困难


### MVVM（Model-View-ViewModel)



![MVVM](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/mvvm.png)


如上图所示：MVVM模式是在MVP模式的基础上进行了改良，将**Presenter**改良成**ViewModel**（抽象视图）：

- **ViewModel**：内部集成了**Binder**(Data-binding Engine，数据绑定引擎)，在MVP中派发器**View**或**Model**的更新都需要通过**Presenter**手动设置，而**Binder**则会实现**View**和**Model**的双向绑定，从而实现**View**或**Model**的自动更新。
- **View**：可组件化，例如目前各种流行的UI组件框架，**View**的变化会通过**Binder**自动更新相应的**Model**。
- **Model**：**Model**的变化会被**Binder**监听(仍然是通过观察者模式)，一旦监听到变化，**Binder**就会自动实现视图的更新。

可以发现，MVVM在MVP的基础上带来了大量的好处，例如：

- 提升了可维护性，解决了MVP大量的手动同步的问题，提供双向绑定机制。
- 简化了测试，同步逻辑是交由**Binder**处理，**View**跟着**Model**同时变更，所以只需要保证**Model**的正确性，**View**就正确。

当然也带来了一些额外的问题：

- 产生性能问题，对于简单的应用会造成额外的性能消耗。
- 对于复杂的应用，视图状态较多，视图状态的维护成本增加，**ViewModel**构建和维护成本高。




对前端开发而言MVVM是非常好的一种设计模式。在浏览器中，路由层可以将控制权交由适当的**ViewModel**，后者又可以更新并响应持续的View，并且通过一些小修改MVVM模式可以很好的运行在服务器端，其中的原因就在于**Model**与**View**已经完全没有了依赖关系（通过View与Model的去耦合，可以允许短暂**View**与持续**View**的并存），这允许**View**经由给定的**ViewModel**进行渲染。


> 目前流行的框架Vue、React以及Angular都是MVVM设计模式的一种实现，并且都可以实现服务端渲染。需要注意目前的Web前端开发和传统Model2需要模板引擎渲染的方式不同，通过Node启动服务进行页面渲染，并且通过代理的方式转发请求后端数据，完全可以从后端的苦海中脱离，这样一来也可以大大的解放Web前端的生产力。

### 观察者模式和发布/订阅模式


#### 观察者模式

观察者模式是使用一个subject目标对象维持一系列依赖于它的observer观察者对象，将有关状态的任何变更自动通知给这一系列观察者对象。当subject目标对象需要告诉观察者发生了什么事情时，它会向观察者对象们广播一个通知。


![Observer](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/observer.png)

如上图所示：一个或多个观察者对目标对象的状态感兴趣时，可以将自己依附在目标对象上以便注册感兴趣的目标对象的状态变化，目标对象的状态发生改变就会发送一个通知消息，调用每个观察者的更新方法。如果观察者对目标对象的状态不感兴趣，也可以将自己从中分离。


#### 发布/订阅模式

发布/订阅模式使用一个事件通道，这个通道介于订阅者和发布者之间，该设计模式允许代码定义应用程序的特定事件，这些事件可以传递自定义参数，自定义参数包含订阅者需要的信息，采用事件通道可以避免发布者和订阅者之间产生依赖关系。

![Pub/Sub](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/pub_sub.png)

> 学生时期很长一段时间内用过Redis的发布/订阅机制，具体可查看[zigbee-door/zigbee-tcp](https://github.com/zigbee-door/zigbee-tcp)，但是惭愧的是没有好好阅读过这一块的源码。

#### 两者的区别

观察者模式：允许观察者实例对象(订阅者)执行适当的事件处理程序来注册和接收目标实例对象(发布者)发出的通知（即在观察者实例对象上注册`update`方法），使订阅者和发布者之间产生了依赖关系，且没有事件通道。不存在封装约束的单一对象，目标对象和观察者对象必须合作才能维持约束。 观察者对象向订阅它们的对象发布其感兴趣的事件。通信只能是单向的。

发布/订阅模式：单一目标通常有很多观察者，有时一个目标的观察者是另一个观察者的目标。通信可以实现双向。该模式存在不稳定性，发布者无法感知订阅者的状态。


## Vue的运行机制简述

![Vue](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/vue.png)


这里简单的描述一下Vue的运行机制（需要注意分析的是 Runtime + Compiler 的 Vue.js）。


### 初始化流程

- 创建Vue实例对象
- `init`过程会初始化生命周期，初始化事件中心，初始化渲染、执行`beforeCreate`周期函数、初始化 `data`、`props`、`computed`、`watcher`、执行`created`周期函数等。
- 初始化后，调用`$mount`方法对Vue实例进行挂载（挂载的核心过程包括**模板编译**、**渲染**以及**更新**三个过程）。
- 如果没有在Vue实例上定义`render`方法而是定义了`template`，那么需要经历编译阶段。需要先将`template` 字符串编译成 `render function`，`template` 字符串编译步骤如下 ：
	- `parse`正则解析`template`字符串形成AST（抽象语法树，是源代码的抽象语法结构的树状表现形式）
	- `optimize`标记静态节点跳过diff算法（diff算法是逐层进行比对，只有同层级的节点进行比对，因此时间的复杂度只有O(n)。如果对于时间复杂度不是很清晰的，可以查看我写的文章[ziyi2/algorithms-javascript/渐进记号](https://github.com/ziyi2/algorithms-javascript/blob/master/doc/function-growth/asymptotic-symbol.md)）
	- `generate`将AST转化成`render function`字符串
- 编译成`render function` 后，调用`$mount`的`mountComponent`方法，先执行`beforeMount`钩子函数，然后核心是实例化一个渲染`Watcher`，在它的回调函数（初始化的时候执行，以及组件实例中监测到数据发生变化时执行）中调用`updateComponent`方法（此方法调用`render`方法生成虚拟Node，最终调用`update`方法更新DOM）。
- 调用`render`方法将`render function`渲染成虚拟的Node（真正的 DOM 元素是非常庞大的，因为浏览器的标准就把 DOM 设计的非常复杂。如果频繁的去做 DOM 更新，会产生一定的性能问题，而 Virtual DOM 就是用一个原生的 JavaScript 对象去描述一个 DOM 节点，所以它比创建一个 DOM 的代价要小很多，而且修改属性也很轻松，还可以做到跨平台兼容），`render`方法的第一个参数是`createElement`(或者说是`h`函数)，这个在官方文档也有说明。
- 生成虚拟DOM树后，需要将虚拟DOM树转化成真实的DOM节点，此时需要调用`update`方法，`update`方法又会调用`pacth`方法把虚拟DOM转换成真正的DOM节点。需要注意在图中忽略了新建真实DOM的情况（如果没有旧的虚拟Node，那么可以直接通过`createElm`创建真实DOM节点），这里重点分析在已有虚拟Node的情况下，会通过`sameVnode`判断当前需要更新的Node节点是否和旧的Node节点相同（例如我们设置的`key`属性发生了变化，那么节点显然不同），如果节点不同那么将旧节点采用新节点替换即可，如果相同且存在子节点，需要调用`patchVNode `方法执行diff算法更新DOM，从而提升DOM操作的性能。


> 需要注意在初始化阶段，没有详细描述数据的响应式过程，这个在响应式流程里做说明。

### 响应式流程


- 在`init`的时候会利用`Object.defineProperty`方法（不兼容IE8）监听Vue实例的响应式数据的变化从而实现数据劫持能力（利用了JavaScript对象的访问器属性`get`和`set`，在未来的Vue3中会使用ES6的`Proxy`来优化响应式原理）。在初始化流程中的编译阶段，当`render function`被渲染的时候，会读取Vue实例中和视图相关的响应式数据，此时会触发`getter`函数进行**依赖收集**（将观察者`Watcher`对象存放到当前闭包的订阅者`Dep`的`subs`中），此时的数据劫持功能和观察者模式就实现了一个MVVM模式中的**Binder**，之后就是正常的渲染和更新流程。
- 当数据发生变化或者视图导致的数据发生了变化时，会触发数据劫持的`setter`函数，`setter`会通知初始化**依赖收集**中的`Dep`中的和视图相应的`Watcher`，告知需要重新渲染视图，`Wather`就会再次通过`update`方法来更新视图。


> 可以发现只要视图中添加监听事件，自动变更对应的数据变化时，就可以实现数据和视图的双向绑定了。


## 基于Vue机制的简易MVVM实现

了解了MV*设计模式、观察者模式以及Vue运行机制之后，可能对于整个MVVM模式有了一个感性的认知，因此可以来手动实现一下，这里实现过程包括如下几个步骤：

- MVVM的实现演示
- MVVM的流程设计
- [中介者模式](https://github.com/ziyi2/mvvm/tree/master/demo/mediator)的实现
- [数据劫持](https://github.com/ziyi2/mvvm/tree/master/demo/hijack)的实现
- [数据双向绑定](https://github.com/ziyi2/mvvm/tree/master/demo/dataBinder)的实现
- [简易视图指令的编译过程](https://github.com/ziyi2/mvvm/tree/master/demo/view)的实现
- [ViewModel](https://github.com/ziyi2/mvvm/tree/master/demo/viewModel)的实现
- [MVVM](https://github.com/ziyi2/mvvm/tree/master/mvvm)的实现


### MVVM的实现演示


MVVM示例的使用如下所示，包括`browser.js`(View视图的更新)、`mediator.js`(中介者)、`binder.js`(MVVM的数据绑定引擎)、`view.js`(视图)、`hijack.js`(数据劫持)以及`mvvm.js`(MVVM实例)。本示例相关的代码可查看github的[ziyi2/mvvm](https://github.com/ziyi2/mvvm)：

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



![MVVM Demo](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/mvvm-demo.gif)





### MVVM的流程设计


![Mvvm](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/ziyi2-mvvm.png)

这里简单的描述一下MVVM实现的运行机制。

#### 初始化流程

- 创建MVVM实例对象，初始化实例对象的`options`参数
- `proxyData`将MVVM实例对象的`data`数据代理到MVVM实例对象上
- `Hijack`类实现数据劫持功能（对MVVM实例跟视图对应的响应式数据进行监听，这里和Vue运行机制不同，干掉了`getter`依赖搜集功能）
- 解析视图指令，对MVVM实例与视图关联的DOM元素转化成文档碎片并进行绑定指令解析（`b-value`、`b-on-input`、`b-html`等，其实是Vue编译的超级简化版），
- 添加数据订阅和用户监听事件，将视图指令对应的数据挂载到**Binder**数据绑定引擎上（数据变化时通过Pub/Sub模式通知**Binder**绑定器更新视图）
- 使用Pub/Sub模式代替Vue中的Observer模式
- **Binder**采用了命令模式解析视图指令，调用`update`方法对View解析绑定指令后的文档碎片进行更新视图处理
- `Browser`采用了外观模式对浏览器进行了简单的兼容性处理


#### 响应式流程


- 监听用户输入事件，对用户的输入事件进行监听
- 调用MVVM实例对象的数据设置方法更新数据
- 数据劫持触发`setter`方法
- 通过发布机制发布数据变化
- 订阅器接收数据变更通知，更新数据对应的视图


### 中介者模式的实现

最简单的中介者模式只需要实现发布、订阅和取消订阅的功能。发布和订阅之间通过事件通道（channels）进行信息传递，可以避免观察者模式中产生依赖的情况。中介者模式的代码如下：

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
    console.info('[mediator][sub] -> this.channels: ', this.channels)
    return this.uid
  }

  /** 
   * @Desc:   发布频道 
   * @Parm:   {String} channel 频道
   *          {Any} data 数据 
   */  
  pub(channel, data) {
    console.info('[mediator][pub] -> chanel: ', channel)
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
        console.info('[mediator][cancel][delete] -> chanel: ', channel)
        console.info('[mediator][cancel] -> chanels: ', channels)
        return
      }
      for(let i=0,len=ch.length; i<len; i++) {
          if(ch[i].uid === uid) {
            ch.splice(i,1)
            console.info('[mediator][cancel][splice] -> chanel: ', channel)
            console.info('[mediator][cancel] -> chanels: ', channels)
            return
          }
      }
    }
  }
}
```

在每一个MVVM实例中，都需要实例化一个中介者实例对象，中介者实例对象的使用方法如下：

``` javascript
let mediator = new Mediator()
// 订阅channel1
let channel1First = mediator.sub('channel1', (data) => {
  console.info('[mediator][channel1First][callback] -> data', data)
})
// 再次订阅channel1
let channel1Second = mediator.sub('channel1', (data) => {
  console.info('[mediator][channel1Second][callback] -> data', data)
})
// 订阅channel2
let channel2 = mediator.sub('channel2', (data) => {
  console.info('[mediator][channel2][callback] -> data', data)
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


### 数据劫持的实现

#### 对象的属性

对象的属性可分为数据属性（特性包括`[[Value]]`、`[[Writable]]`、`[[Enumerable]]`、`[[Configurable]]`）和存储器/访问器属性（特性包括`[[ Get ]]`、`[[ Set ]]`、`[[Enumerable]]`、`[[Configurable]]`），对象的属性只能是数据属性或访问器属性的其中一种，这些属性的含义：

- `[[Configurable]]`: 表示能否通过 `delete` 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为访问器属性。
- `[[Enumerable]]`:  对象属性的可枚举性。
- `[[Value]]`: 属性的值，读取属性值的时候，从这个位置读；写入属性值的时候，把新值保存在这个位置。这个特性的默认值为 `undefined`。
- `[[Writable]]`: 表示能否修改属性的值。
- `[[ Get ]]`: 在读取属性时调用的函数。默认值为 `undefined`。
- `[[ Set ]]`: 在写入属性时调用的函数。默认值为 `undefined`。

> 数据劫持就是使用了`[[ Get ]]`和`[[ Set ]]`的特性，在访问对象的属性和写入对象的属性时能够自动触发属性特性的调用函数，从而做到监听数据变化的目的。

对象的属性可以通过ES5的设置特性方法`Object.defineProperty(data, key, descriptor)`改变属性的特性，其中`descriptor`传入的就是以上所描述的特性集合。

#### 数据劫持

``` javascript
let hijack = (data) => {
  if(typeof data !== 'object') return
  for(let key of Object.keys(data)) {
    let val = data[key]
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get() {
        console.info('[hijack][get] -> val: ', val)
        // 和执行 return data[key] 有什么区别 ？
        return val
      },
      set(newVal) {
        if(newVal === val) return
        console.info('[hijack][set] -> newVal: ', newVal)
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
console.info(Object.getOwnPropertyDescriptor(job, "type"))
// 访问器属性
console.info(Object.getOwnPropertyDescriptor(person, "name"))
```


注意Vue3.0将不产用`Object.defineProperty`方式进行数据监听，原因在于
- 无法监听数组的变化（目前的数组监听都基于对原生数组的一些方法进行`hack`，所以如果要使数组响应化，需要注意使用Vue官方推荐的一些数组方法）
- 无法深层次监听对象属性

在Vue3.0中将产用`Proxy`解决以上痛点问题，当然会产生浏览器兼容性问题（例如万恶的IE，具体可查看[Can I use proxy](https://caniuse.com/#search=proxy)）。

> 需要注意是的在`hijack`中只进行了一层属性的遍历，如果要做到对象深层次属性的监听，需要继续对`data[key]`进行`hijack`操作，从而可以达到属性的深层次遍历监听，具体可查看[mvvm/mvvm/hijack.js](https://github.com/ziyi2/mvvm/blob/master/mvvm/hijack.js)，


### 数据双向绑定的实现


![data-binding](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/data-binding.png)

如上图所示，数据双向绑定主要包括数据的变化引起视图的变化（**Model** -> 监听数据变化 -> **View**）、视图的变化又改变数据（**View** -> 用户输入监听事件 -> **Model**），从而实现数据和视图之间的强联系。

在实现了数据监听的基础上，加上用户输入事件以及视图更新，就可以简单实现数据的双向绑定（其实就是一个最简单的**Binder**，只是这里的代码耦合严重）：


``` htmlbars
<input id="input" type="text">
<div id="div"></div>
```

``` javascript
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
hijack(data)

// model -> view
data.input = '11111112221'

// view -> model
input.oninput = function(e) {
  // model -> view
  data.input = e.target.value
}
```


> [数据双向绑定的demo源码](https://github.com/ziyi2/mvvm/tree/master/demo/dataBinder)。

### 简易视图指令的编译过程实现

在MVVM的实现演示中，可以发现使用了`b-value`、`b-text`、`b-on-input`、`b-html`等绑定属性（这些属性在该MVVM示例中自行定义的，并不是html标签原生的属性，类似于vue的`v-html`、`v-model`、`v-text`指令等），这些指令只是方便用户进行Model和View的同步绑定操作而创建的，需要MVVM实例对象去识别这些指令并重新渲染出最终需要的DOM元素，例如

``` javascript
<div id="app">
  <input type="text" b-value="message">
</div>
```

最终需要转化成真实的DOM

``` javascript
<div id="app">
  <input type="text" value='Hello World' />
</div>
```

那么实现以上指令解析的步骤主要如下：

- 获取对应的`#app`元素
- 转换成文档碎片（从DOM中移出`#app`下的所有子元素）
- 识别出文档碎片中的绑定指令并重新修改该指令对应的DOM元素
- 处理完文档碎片后重新渲染`#app`元素

HTML代码如下：

``` htmlbars
<div id="app">
 <input type="text" b-value="message" />
 <input type="text" b-value="message" />
 <input type="text" b-value="message" />
</div>

<script src="./browser.js"></script>
<script src="./binder.js"></script>
<script src="./view.js"></script>
```

首先来看示例的使用

``` javascript
// 模型
let model = {
  message: 'Hello World',
  
  getData(key) {
    let val = this
    let keys = key.split('.')
    for(let i=0, len=keys.length; i<len; i++) {
      val = val[keys[i]]
      if(!val && i !== len - 1) { throw new Error(`Cannot read property ${keys[i]} of undefined'`) }
    }
    return val
  }
}

// 抽象视图(实现功能将b-value中对应的model.message转换成最终的value="Hello World")
new View('#app', model)
```

在`view.js`中实现了`#app`下的元素转化成文档碎片以及对所有子元素进行属性遍历操作（用于`binder.js`的绑定属性解析）

``` javascript
class View {
  constructor(el, model) {
    this.model = model
    // 获取需要处理的node节点
    this.el = el.nodeType === Node.ELEMENT_NODE ? el : document.querySelector(el)
    if(!this.el) return
    // 将已有的el元素的所有子元素转成文档碎片
    this.fragment = this.node2Fragment(this.el)
    // 解析和处理绑定指令并修改文档碎片
    this.parseFragment(this.fragment)
    // 将文档碎片重新添加到dom树
    this.el.appendChild(this.fragment)
  }

  /** 
   * @Desc:   将node节点转为文档碎片 
   * @Parm:   {Object} node Node节点 
   */  
  node2Fragment(node) {
    let fragment = document.createDocumentFragment(),
        child;
    while(child = node.firstChild) {
      // 给文档碎片添加节点时，该节点会自动从dom中删除
      fragment.appendChild(child)
    }    
    return fragment
  }

  /** 
   * @Desc:   解析文档碎片(在parseFragment中遍历的属性，需要在binder.parse中处理绑定指令的解析处理) 
   * @Parm:   {Object} fragment 文档碎片 
   */  
  parseFragment(fragment) {
    // 类数组转化成数组进行遍历
    for(let node of [].slice.call(fragment.childNodes)) {
      if(node.nodeType !== Node.ELEMENT_NODE) continue
      // 绑定视图指令解析
      for(let attr of [].slice.call(node.attributes)) {
        binder.parse(node, attr, this.model)
        // 移除绑定属性
        node.removeAttribute(attr.name)
      }
      // 遍历node节点树
      if(node.childNodes && node.childNodes.length) this.parseFragment(node)
    }
  }
}
```


接下来查看`binder.js`如何处理绑定指令，这里以`b-value`的解析为示例

``` javascript
(function(window, browser){
  window.binder = {
    /** 
     * @Desc:   判断是否是绑定属性 
     * @Parm:   {String} attr Node节点的属性 
     */  
    is(attr) {
      return attr.includes('b-')
    },
    /** 
     * @Desc:   解析绑定指令
     * @Parm:   {Object} attr html属性对象
     *          {Object} node Node节点
     *          {Object} model 数据
     */  
    parse(node, attr, model) {
	  // 判断是否是绑定指令，不是则不对该属性进行处理
      if(!this.is(attr.name)) return
      // 获取model数据
      this.model = model 
      // b-value = 'message'， 因此attr.value = 'message'
      let bindValue = attr.value,
	      // 'b-value'.substring(2) = value
          bindType = attr.name.substring(2)
      // 绑定视图指令b-value处理
      // 这里采用了命令模式
      this[bindType](node, bindValue.trim())
    },
    /** 
     * @Desc:   值绑定处理(b-value)
     * @Parm:   {Object} node Node节点
     *          {String} key model的属性
     */  
    value(node, key) {
      this.update(node, key)
    },
    /** 
     * @Desc:   值绑定更新(b-value)
     * @Parm:   {Object} node Node节点
     *          {String} key model的属性
     */  
    update(node, key) {
	  // this.model.getData是用于获取model对象的属性值
	  // 例如 model = { a : { b : 111 } }
	  // <input type="text" b-value="a.b" />
	  // this.model.getData('a.b') = 111
	  // 从而可以将input元素更新为<input type="text" value="111" />
	  browser.val(node, this.model.getData(key))
    }
  }
})(window, browser)
```

在`browser.js`中使用外观模式对浏览器原生的事件以及DOM操作进行了再封装，从而可以做到浏览器的兼容处理等，这里只对`b-value`需要的DOM操作进行了封装处理，方便阅读

```javascript
let browser = {
  /** 
   * @Desc:   Node节点的value处理 
   * @Parm:   {Object} node Node节点   
   *          {String} val 节点的值
   */  
  val(node, val) {
	// 将b-value转化成value，需要注意的是解析完后在view.js中会将b-value属性移除
    node.value = val || ''
    console.info(`[browser][val] -> node: `, node)
    console.info(`[browser][val] -> val: `, val)
  }
}
```

> 至此MVVM示例中简化的**Model** -> **ViewModel** (未实现数据监听功能)-> **View**路走通，可以查看[视图绑定指令的解析的demo](https://github.com/ziyi2/mvvm/tree/master/demo/view)。


### ViewModel的实现

**ViewModel**(内部绑定器**Binder**)的作用不仅仅是实现了**Model**到**View**的自动同步（Sync Logic）逻辑（以上视图绑定指令的解析的实现只是实现了一个视图的绑定指令初始化，一旦**Model**变化，视图要更新的功能并没有实现），还实现了**View**到**Model**的自动同步逻辑，从而最终实现了数据的双向绑定。

![MVVM](https://raw.githubusercontent.com/ziyi2/mvvm/master/images/mvvm.png)


因此只要在视图绑定指令的解析的基础上增加**Model**的数据监听功能（数据变化更新视图）和**View**视图的`input`事件监听功能（监听视图从而更新相应的**Model**数据，注意**Model**的变化又会因为数据监听从而更新和**Model**相关的视图）就可以实现**View**和**Model**的双向绑定。同时需要注意的是，数据变化更新视图的过程需要使用发布/订阅模式，如果对流程不清晰，可以继续回看MVVM的结构设计。


在**简易视图指令的编译过程实现**的基础上进行修改，首先是HTML代码

``` htmlbars
<div id="app">
 <input type="text" id="input1" b-value="message">
 <input type="text" id="input2" b-value="message">
 <input type="text" id="input3" b-value="message">
</div>

<!-- 新增中介者 -->
<script src="./mediator.js"></script>
<!-- 新增数据劫持 -->
<script src="./hijack.js"></script>
<script src="./view.js"></script>
<script src="./browser.js"></script>
<script src="./binder.js"></script>
```

>`mediator.js`不再叙述，具体回看**中介者模式的实现**，`view.js`和`browser.js`也不再叙述，具体回看**简易视图指令的编译过程实现**。


示例的使用：

``` javascript
// 模型
let model = {
  message: 'Hello World',
  setData(key, newVal) {
    let val = this
    let keys = key.split('.')
    for(let i=0, len=keys.length; i<len; i++) {
      if(i < len - 1) {
        val = val[keys[i]]
      } else {
        val[keys[i]] = newVal
      }
    }
    // console.log('[mvvm][setData] -> val: ', val)
  },
  getData(key) {
    let val = this
    let keys = key.split('.')
    for(let i=0, len=keys.length; i<len; i++) {
      val = val[keys[i]]
      if(!val && i !== len - 1) { throw new Error(`Cannot read property ${keys[i]} of undefined'`) }
    }
    return val
  }
}
// 发布/订阅对象
let mediator = new Mediator()
// 数据劫持(监听model的变化，并发布model数据变化消息)
hijack(model, mediator)
// 抽象视图(实现绑定指令的解析，并订阅model数据的变化从而更新视图)
new View('#app', model, mediator)
// model -> view (会触发数据劫持的set函数，从而发布model变化，在binder中订阅model数据变化后会更新视图)
model.message = 'Hello Ziyi233333222'
```

首先看下数据劫持，在** 数据劫持的实现**的基础上，增加了中介者对象的发布数据变化功能（在抽象视图的**Binder**中会订阅这个数据变化）

``` javascript
var hijack = (function() {

  class Hijack {
    /** 
     * @Desc:   数据劫持构造函数
     * @Parm:   {Object} model 数据 
     *          {Object} mediator 发布订阅对象 
     */  
    constructor(model, mediator) {
      this.model = model
      this.mediator = mediator
    }
  
    /** 
     * @Desc:   model数据劫持
     * @Parm:   
     *          
     */  
    hijackData() {
      let { model, mediator } = this
      for(let key of Object.keys(model)) {
        let val = model[key]
        Object.defineProperty(model, key, {
          enumerable: true,
          configurable: false,
          get() {
            return val
          },
          set(newVal) {
            if(newVal === val) return
            val = newVal
            // 发布数据劫持的数据变化信息
            console.log('[mediator][pub] -> key: ', key)
            // 重点注意这里的通道，在最后的MVVM示例中和这里的实现不一样
            mediator.pub(key)
          }
        })
      }
    }
  }

  return (model, mediator) => {
    if(!model || typeof model !== 'object') return
    new Hijack(model, mediator).hijackData()
  }
})()
```

接着重点来看`binder.js`中的实现

``` javascript
(function(window, browser){
  window.binder = {
    /** 
     * @Desc:   判断是否是绑定属性 
     * @Parm:   {String} attr Node节点的属性 
     */  
    is(attr) {
      return attr.includes('b-')
    },

    /** 
     * @Desc:   解析绑定指令
     * @Parm:   {Object} attr html属性对象
     *          {Object} node Node节点
     *          {Object} model 数据
     *          {Object} mediator 中介者
     */  
    parse(node, attr, model, mediator) {
      if(!this.is(attr.name)) return
      this.model = model 
      this.mediator = mediator
      let bindValue = attr.value,
          bindType = attr.name.substring(2)
      // 绑定视图指令处理
      this[bindType](node, bindValue.trim())
    },
    
    /** 
     * @Desc:   值绑定处理(b-value)
     * @Parm:   {Object} node Node节点
     *          {String} key model的属性
     */  
    value(node, key) {
      this.update(node, key)
      // View -> ViewModel -> Model
      // 监听用户的输入事件
      browser.event.add(node, 'input', (e) => {
        // 更新model
        let newVal = browser.event.target(e).value
        // 设置对应的model数据(因为进行了hijack(model))
        // 因为进行了hijack(model)，对model进行了变化监听，因此会触发hijack中的set，从而触发set中的mediator.pub
        this.model.setData(key, newVal)
      })

	  // 一旦model变化，数据劫持会mediator.pub变化的数据		
      // 订阅数据变化更新视图(闭包)
      this.mediator.sub(key, () => {
        console.log('[mediator][sub] -> key: ', key)
        console.log('[mediator][sub] -> node: ', node)
        this.update(node, key)
      })
    },
    
    /** 
     * @Desc:   值绑定更新(b-value)
     * @Parm:   {Object} node Node节点
     *          {String} key model的属性
     */  
    update(node, key) {
      browser.val(node, this.model.getData(key))
    }
  }
})(window, browser)
```

> 最终实现了具有**viewModel**的MVVM简单实例，具体查看[ViewModel的实现的demo](https://github.com/ziyi2/mvvm/tree/master/demo/viewModel)。


### MVVM的实现

在**ViewModel的实现**的基础上：

- 新增了`b-text`、`b-html`、`b-on-*`(事件监听)指令的解析
- 代码封装更优雅，新增了MVVM类用于约束管理之前示例中零散的实例对象（建造者模式）
- `hijack.js`实现了对**Model**数据的深层次监听
- `hijack.js`中的发布和订阅的`channel`采用HTML属性中绑定的指令对应的值进行处理(例如`b-value="a.b.c.d"`，那么`channel`就是`'a.b.c.d'`，这里是将Vue的观察者模式改成中介者模式后的一种尝试，只是一种实现方式，当然采用观察者模式关联性更强，而采用中介者模式会更解耦)。
- `browser.js`中新增了事件监听的兼容处理、`b-html`和`b-text`等指令的DOM操作api等


由于篇幅太长了，这里就不过多做说明了，感兴趣的童鞋可以直接查看[ziyi2/mvvm](https://github.com/ziyi2/mvvm/tree/master/mvvm)，需要注意该示例中还存在一定的缺陷，例如**Model**的属性是一个对象，且该对象被重写时，发布和订阅维护的`channels`中未将旧的属性监听的`channel`移除处理。


## 设计模式

在以上MVVM示例的实现中，我也是抱着学习的心态用到了以下[设计模式](https://ziyi2.github.io/2018/07/15/js%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.html#more)，如果对这些设计模式不了解，则可以前往查看示例代码。


>-  [外观模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#facade%E5%A4%96%E8%A7%82%E6%A8%A1%E5%BC%8F)
>-  [构造器模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#constructor%E6%9E%84%E9%80%A0%E5%99%A8%E6%A8%A1%E5%BC%8F)
>-  [模块模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#module%E6%A8%A1%E5%9D%97%E6%A8%A1%E5%BC%8F)
>-  [中介者模式（发布/订阅模式）](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#mediator%E4%B8%AD%E4%BB%8B%E8%80%85%E6%A8%A1%E5%BC%8F)
>- [原型模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#prototype%E5%8E%9F%E5%9E%8B%E6%A8%A1%E5%BC%8F)
>- [命令模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#command%E5%91%BD%E4%BB%A4%E6%A8%A1%E5%BC%8F)
>- [建造者模式](https://github.com/ziyi2/js/blob/master/JS%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F.md#%E5%BB%BA%E9%80%A0%E8%80%85%E6%A8%A1%E5%BC%8F)



## 参考资源

- [GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html) - 多种架构在UI设计中追溯思想的知识史
- [Understanding JavaServer Pages Model 2 architecture](https://www.javaworld.com/article/2076557/understanding-javaserver-pages-model-2-architecture.html) - 讲述JSP Model1参考MVC进阶JSP Model2的故事
- [Scaling Isomorphic Javascript Code](https://blog.nodejitsu.com/scaling-isomorphic-javascript-code/) - 单页应用的首屏速度与SEO优化问题启示录
- [界面之下：还原真实的MV*模式 ](https://github.com/livoras/blog/issues/11) - 了解MV*模式
- [DMQ/mvvm](https://github.com/DMQ/mvvm) - 剖析vue实现原理，自己动手实现mvvm

