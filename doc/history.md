# MV*架构设计模式的演变历史

## MV*模式的诞生

早前GUI(图形用户界面)应用程序的设计流程如下

- 用户在视图(View)上的行为（键盘、鼠标）执行应用逻辑(Application Logic)，应用逻辑会触发业务逻辑(Business Logic)，从而可以变更数据(Model)。
- 数据(Model)变更后当然需要同步(Sync)变更到视图(View)。

程序的设计是杂乱无章的，没有明确的分层设计概念（View和Model天然可以分层），维护起来也很困难。为了使程序的设计更加规范化以及变得更好维护，使得Login(Application Logic/Business Logic)和Sync更清晰，于是产生了MV*模式！

## MVC(模型-视图-控制器)模式

#### 历史背景

早在上个世纪70年代，美国的施乐公司（Xerox）的工程师研发了Smalltalk编程语言，并且开始用它编写GUI。而在Smalltalk-80版本的时候，一位叫Trygve Reenskaug的工程师设计了MVC的架构模式，极大地降低了GUI的管理难度。

#### 依赖关系

MVC把GUI分成View、Model、Controller三个层次。Controller可热插拔，主要进行Model和View之间的协作（路由、输入预处理等）的应用逻辑。

#### 调用关系

View传递调用Controller；Controller操作Model；然后由Model执行业务逻辑。Model变更，通过观察者模式通知View。

#### 关键点

Model的更新通过观察者模式，可以实现多视图共享同一个Model实现更新问题。Controller和View其实可以互相依赖(并不一定是单向的)。

#### 优缺点

- 优点： 职责分离、解耦、可复用、可扩展性、观察者模式多视图更新
- 缺点：Controller测试困难（View需要UI环境）、View无法组件化（View强依赖特定的Model）

#### Web前端示例

- maria.js(严格遵守Smalltalk-80 MVC模式)
- backboneJS
- ember.js
- JavaScript MVC
- knockout.js
- Batman.js
- Agility.js


### MVC Model1和Model2
#### 


#### MVC Model 2 模式

经典MVC只用于解决GUI问题，Web服务端的开发也会接触MVC，称做MVC Model 2。但是此时HTTP协议是单工无状态协议，Model通过观察者告知View的环节被破坏。

#### 调用关系

服务端接收到来自客户端的请求，服务端通过路由规则把这个请求交由给特定的Controller进行处理，Controller执行相应的应用逻辑，对Model进行操作，Model执行业务逻辑以后；然后用数据去渲染特定的模版，返回给客户端。














