// 中介者
class Mediator {
  constructor() {
    this.channels = {}
    this.uid = 0
  }

  /** 
   * @Author: zhuxiankang 
   * @Date:   2018-07-11 10:34:33  
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
   * @Author: zhuxiankang 
   * @Date:   2018-07-11 10:35:15  
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
   * @Author: zhuxiankang 
   * @Date:   2018-07-11 11:56:06  
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


let mediator = new Mediator()

let channel1First = mediator.sub('channel1', (data) => {
  console.log('[mediator][channel1First][callback] -> data', data)
})
<<<<<<< HEAD
=======

>>>>>>> 886af83f9a50c6528600bbb2606841ddc8e1039f
let channel1Second = mediator.sub('channel1', (data) => {
  console.log('[mediator][channel1Second][callback] -> data', data)
})
let channel2 = mediator.sub('channel2', (data) => {
  console.log('[mediator][channel2][callback] -> data', data)
})

mediator.pub('channel1', { name: 'ziyi1' })
mediator.pub('channel2', { name: 'ziyi2' })

mediator.cancel(channel1Second)
mediator.pub('channel1', { name: 'ziyi1' })