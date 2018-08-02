# MV*架构设计模式的演变历史

## MV*模式的诞生

起初在设计GUI（图形用户界面）应用程序的时候，代码是杂乱无章的，通常难以管理和维护。

<img  width="400px" src="http://onh40c6zw.bkt.clouddn.com/%5Bmvvm%5Dmv%2A.jpeg"/>

起初的GUI如上图所示：

- 用户在视图（View）上的行为（键盘、鼠标）执行应用逻辑（Application Logic），应用逻辑会触发业务逻辑（Business Logic），从而可以变更数据（Model）。
- 数据（Model）变更后当然需要同步（Sync）变更到视图（View）。

> 需要注意的是GUI中的View（视图）和Model（数据）是天然可以进行分层的，而相对难以管理的是应用逻辑（Application Login）和同步视图（Sync）变更。

为了不断优化Sync和Logic的杂乱无章，首先出现了MVC模式，随着MVC的不断发展和演变，又出现了后续的MV*（MVP、MVVM等）系列模式。


### MVC（模型-视图-控制器）

早在上个世纪70年代，美国的施乐公司（Xerox）的工程师研发了Smalltalk编程语言，并且开始用它编写GUI。而在Smalltalk-80版本的时候，一位叫Trygve Reenskaug的工程师设计了MVC的架构模式，极大地降低了GUI的管理难度。

<img  width="400px" src="http://onh40c6zw.bkt.clouddn.com/%5Bmvvm%5Dmvc.png"/>

如上图所示，MVC把GUI分成View、Model、Controller（可热插拔，主要进行Model和View之间的协作（路由、输入预处理等）的应用逻辑）三个层次。

- 调用关系：View传递调用Controller；Controller操作Model；然后由Model执行业务逻辑。Model变更，通过观察者模式通知View（需要注意此时View如果要更新还得重新获取Model的数据）。
- 关键点：Model的更新通过观察者模式，可以实现多视图共享同一个Model实现更新问题。Controller和View其实可以互相依赖。
- 优点：职责分离、解耦、可复用、可扩展性
- 缺点：Controller测试困难（View需要UI环境）、View无法组件化（View强依赖特定的Model）

> Web前端的MVC案例：maria.js(严格遵守Smalltalk-80 MVC模式)、backboneJS、ember.js、JavaScript MVC、knockout.js、Batman.js、Agility.js等。


#### MVC Model 2

经典MVC只用于解决GUI问题，Web服务端的开发也发展了MVC模式（当然也是为了易于代码的管理维护），称做MVC Model2。

<img  width="400px" src="http://onh40c6zw.bkt.clouddn.com/%5Bmvvm%5Dmvc_model_2.png"/>

如上图所示，服务端接收到来自客户端的请求，服务端通过路由规则把这个请求交由给特定的Controller进行处理，Controller执行相应的应用逻辑，对Model进行操作，Model执行业务逻辑以后用数据去渲染特定的模版，返回给客户端。

> 和传统MVC不同的是，MVC Model2是通过HTTP协议进行通信的，而HTTP是单工无状态协议，Model通过观察者告知View的环节被破坏（例如难以实现服务端推送）。

当然MVC Model2并不是最早的服务端MVC模式，在这之前还有MVC Model1，如下图所示：

<img  width="600px" src="http://onh40c6zw.bkt.clouddn.com/%5Bmvvm%5Dmvc_model_1_2.png"/>

Model2模式最早在1998年应用在JSP应用程序当中，JSP Model 1应用管理的混乱诱发了JSP参考了客户端MVC模式，催生了Model2。 而在Model1中，JSP同时包含了Controller和View结构，JavaBean(在Model2中只处理业务逻辑)包含了Controller和Model结构，因此相当混乱。需要注意在JSP Model2中，Model的数据变更后，还可能通过JavaBean到Controller（Controller主要识别当前数据对应的JSP）再到JSP（图中稍微有点小错误）因此在服务端MVC中，可能产生这样的流程View -> Controller -> Model -> Controller -> Model这样的流程，和Web前端的MVC流程是不同的。


### MVP（模型-视图-派发器）

MVP模式是MVC模式的改良。在上个世纪90年代，IBM旗下的子公司Taligent在用C/C++开发一个叫CommonPoint的图形界面应用系统的时候提出。

<img  width="400px" src="http://onh40c6zw.bkt.clouddn.com/%5Bmvvm%5Dmvp.png"/>

如上图所示，MVP打破了View原来对于Model的依赖，其余的依赖关系和MVC模式一致。

- 调用关系：Model变更，通过观察者模式通知Presenter（注意在MVC 中是通知View），Presenter通过View提供的接口更新界面，此时的View可称为Passive View。
- 关键点：View不在负责同步逻辑，Presenter负责同步逻辑和应用程序逻辑。View需要提供操作界面的接口给Presenter进行调用。
- 优点：Presenter便于测试、View可组件化设计
- 缺点：Presenter厚、维护困难

> Web前端的MVP案例：Jsviews（发现Web前端采用MVP架构模式设计的框架相对较少，而在Android的开发中相对较多，例如MVPArms、MvpApp和Android-tech-frontier等）。


### MVVM（模型-视图-抽象视图）

MVVM模式是在MVP模式的基础上进行了改良，在MVP中，派发器P需要手动调用View组件化后的接口才能实现视图的更新，而在MVVM模式中，将P改良成抽象视图（VM），

<img  width="400px" src="http://onh40c6zw.bkt.clouddn.com/%5Bmvvm%5Dmvvm.png"/>

如上图所示：MVVM模式是在MVP模式的基础上进行了改良，在MVP中，派发器P需要手动调用View组件化后的接口才能实现视图的更新，而在MVVM模式中，将P改良成抽象视图（ViewModel）。ViewModel中有一个Binder（ Data-binding Engine），在Presenter中负责的View和Model的数据同步逻辑交由Binder处理（注意不包括应用逻辑）。

- 注意点：MVVM实现了View和Model的同步逻辑自动化。MVP中Presenter负责的View和Model同步需要手动进行操作，但是在MVVM中同步逻辑交由Binder进行负责（一旦Model发生变化，Binder会对Model对应的数据进行变化监听，并实现相应视图的更新）。
- 优点：提高可维护性、简化测试
- 缺点：简单GUI应用会产生额外的性能损耗、复杂GUI的ViewModel构建和维护成本高

> Web前端的MVVM案例：AngularJS、Vue、React。


### References

- [Scaling Isomorphic Javascript Code](https://blog.nodejitsu.com/scaling-isomorphic-javascript-code/)
- [Understanding JavaServer Pages Model 2 architecture](https://www.javaworld.com/article/2076557/java-web-development/understanding-javaserver-pages-model-2-architecture.html)
- [GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)
- [界面之下：还原真实的MV*模式](https://github.com/livoras/blog/issues/11)
