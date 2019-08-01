// components/picviewbox/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgsrc:Array,
    autorotate:String,
    maxscale: Number 
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgindex:0,
    dataimg: '',//图片地址
    distance: 0,//手指移动的距离
    moveX:0,
    moveY:0,
    scale: 1,//图片的比例
    baseWidth: null,//图片真实宽度
    baseHeight: null,//图片真实高度
    scaleWidth: '',//图片设显示宽度
    scaleHeight: '',//图片设显示高度
    clientWidth: 0, //容器宽度
    clientHeight: 0, //容器高度
    imgLeft:0,
    imgTop:0,
    endTop:0,
    rotateClass: 'img-normal',//'img-rotate',
    scrollleft:0,
    touchs:0,
    lastTapTime:0,
    animationData: {},
    landscape:0,
    imgdetil:{},
    content_rotate:'content'
  },

  lifetimes: {
    ready: function(){
      wx.showLoading({
        title: '正在加载中...',
      })
      var that = this;
      wx.createSelectorQuery().in(this).select(".images").boundingClientRect( //获取容器宽高
        function (rect) {      
         
          that.data.clientWidth = rect.width
          that.data.clientHeight = rect.height
          that.setData({
            dataimg: that.properties.imgsrc,//'/static/pics/001.jpg',
            scaleHeight: rect.height,
            scaleWidth:rect.width
          })
        }
      ).exec()
      
      if (this.properties.autorotate.toLowerCase()=='true'){ //启动自动旋转功能
        wx.startDeviceMotionListening({
          interval: 'normal',
          success: (res) => {
            console.log('success')
            wx.onDeviceMotionChange((res) => {
              
              if (res.gamma > 45 && res.beta>-5 && that.data.landscape==0) {
                that.setData({
                  rotateClass: "img-rotate",
                  content_rotate: "content-rotate",
                  landscape:1
                },()=>{
                  wx.nextTick(()=>{
                    wx.createSelectorQuery().in(that).select(".images").boundingClientRect( //获取容器宽高
                      function (rect) {
                        console.log('l'+rect.width + ',' + rect.height + ',' + that.data.scaleHeight + ',' + that.data.imgTop)
                        that.data.clientWidth = rect.height
                        that.data.clientHeight = rect.width                        
                      }
                    ).exec()
                  })
                })
              } else if (res.gamma < 5 && res.beta < -50 && that.data.landscape == 1) {
                that.setData({
                  rotateClass: "img-normal",
                  content_rotate: "content",
                  landscape:0
                }, () => {
                  setTimeout(() => {
                    wx.createSelectorQuery().in(that).select(".images").boundingClientRect( //获取容器宽高
                      function (rect) {
                        that.data.clientWidth = rect.height
                        that.data.clientHeight = rect.width
                        console.log(rect.width + ',' + rect.height + ',' + that.data.scaleHeight + ',' + that.data.imgTop)
                        if (that.data.clientHeight > that.data.scaleHeight + that.data.imgTop && that.data.scaleHeight >= that.data.clientHeight){
                         
                          that.setData({
                            imgTop: that.data.imgTop + (that.data.clientHeight - (that.data.scaleHeight + that.data.imgTop)),
                
                          })
                        }
                      }
                    ).exec()
                  },0)
                })
              }
            })
          },
          fail: () => {
            console.log('fail')
          }
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
    * 监听图片加载成功时触发
    */
    imgload: function (e) {
      
      let width, height, left, top, scale = 0
      
      console.log(e)
      if (e.detail.width <= e.detail.height) {
        width = this.data.clientWidth
        height = this.data.clientWidth / e.detail.width * e.detail.height
        top = 0 - height / 2 + this.data.clientHeight / 2
        left = 0
        scale = height / e.detail.height
      } else {
        width = this.data.clientHeight / e.detail.height * e.detail.width
        height = this.data.clientHeight
        left = 0 - width / 2 + this.data.clientWidth / 2
        top = 0
        scale = width / e.detail.width
      }

      this.setData({
        'scale': scale,
        'baseWidth': e.detail.width, //获取图片真实宽度
        'baseHeight': e.detail.height, //获取图片真实高度
        'scaleWidth': width,// e.detail.width+'px',//'100%', //给图片设置宽度
        'scaleHeight': height,
        'imgLeft': left,
        'imgTop': top
      },()=>{
        wx.hideLoading()
      })
                
     
    },
    errImg:function(){
       wx.hideLoading()
    },
    closebox:function(e){
      var myEventDetail = e //{} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('close_picbox', myEventDetail, myEventOption)
    },

    click: function (e) { //双击缩小图片(带动画)
      var curTime = e.timeStamp
      var lastTime = e.currentTarget.dataset.time  // 通过e.currentTarget.dataset.time 访问到绑定到该组件的自定义数据
     
      if (curTime - lastTime > 0) {
        if (curTime - lastTime < 300) { //双击事件
          console.log("双击，用了：" + (curTime - lastTime))

          let animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
          })
          this.animation = animation


          if (this.data.baseWidth<this.data.baseHeight && this.data.clientHeight<this.data.scaleHeight){ //纵向图片
            let _width = this.data.clientHeight / this.data.baseHeight * this.data.baseWidth
            let _left = this.data.clientWidth / 2 - this.data.scaleWidth / 2
            animation.left(0).top(0).width(_width).height(this.data.clientHeight).step()
            animation.step({ duration: 0})
            this.setData({
              scaleWidth: _width,
              scaleHeight: this.data.clientHeight,
              imgLeft: _left,
              imgTop: 0,
              animationData: animation.export(),
              scale: this.data.clientHeight / this.data.baseHeight
            })
      
          }

          if (this.data.baseWidth >= this.data.baseHeight && this.data.clientWidth < this.data.scaleWidth) { //横向图片
            let _height = this.data.clientWidth / this.data.baseWidth * this.data.baseHeight
            let _top = this.data.clientHeight / 2 - _height / 2

            animation.left(0).top(_top).width(this.data.clientWidth).height(_height).step()
            animation.step({ duration: 0 })
            this.setData({
              scaleWidth: this.data.clientWidth,
              scaleHeight: _height,
              imgLeft: 0,
              imgTop: _top,
              animationData: animation.export(),
              scale: this.data.clientWidth / this.data.baseWidth
            })
          }

        }
      }
      this.setData({
        lastTapTime: curTime
      })
    },
    /**
    * 触摸开始
    */
    touchstartCallback: function (e) {
      // 单手指记录坐标
      if (e.touches.length == 1) {
        this.data.touchs = 1
        this.data.moveX = e.touches[0].clientX
        this.data.moveY = e.touches[0].clientY               
      }
      if (e.touches.length == 2) { //双手指触发开始 计算开始触发两个手指坐标的距离
        this.data.touchs = 2
        // 当两根手指放上去的时候，将距离(distance)初始化。
        let xMove = e.touches[1].clientX - e.touches[0].clientX;
        let yMove = e.touches[1].clientY - e.touches[0].clientY;
        //计算开始触发两个手指坐标的距离
        let distance = Math.sqrt(xMove * xMove + yMove * yMove);
        this.setData({
          'distance': distance,
        })
      }
      
    },
     /**
   * 触摸结束
   */
    touchendCallback:function(e){      
      if (e.touches.length ==2 && this.data.touchs ==2 ){
        this.data.endTop = this.data.imgTop
      }
      return
    },
    /**
   * 触摸进行中 
   */
    touchmoveCallback: function (e) {
      // 单手指移动
      if (e.touches.length == 1 && this.data.touchs==1) { 
        let moveX,moveY
        if (this.data.landscape==0){
          moveX = e.touches[0].clientX - this.data.moveX  //计算当前触摸坐标相对于前一个坐标的值
          moveY = e.touches[0].clientY - this.data.moveY
          if (this.data.clientHeight >= (this.data.scaleHeight + this.data.imgTop + moveY) && moveY <= 0) { //检查下边界
            moveY = 0
          }
          if ((this.data.imgTop + moveY) >= 0 && moveY >= 0) { //检查上边界
            moveY = 0
          }
          if ((this.data.imgLeft + moveX) >= 0 && moveX >= 0) { //检查左边界
            moveX = 0
          }
          if (this.data.clientWidth >= (this.data.scaleWidth + this.data.imgLeft + moveX) && moveX <= 0) { //检查右边界
            moveX = 0
          }
          this.setData({
            imgLeft: this.data.imgLeft + moveX,  //当前图片位置加上当前移动的偏移量
            imgTop: this.data.imgTop + moveY,
            moveX: e.touches[0].clientX,  //保存当前触摸坐标
            moveY: e.touches[0].clientY
          })
        }else{
          moveX = e.touches[0].clientY - this.data.moveY  //计算当前触摸坐标相对于前一个坐标的值
          moveY = this.data.moveX -e.touches[0].clientX

          if (this.data.clientWidth >= (this.data.scaleHeight + this.data.imgTop + moveY) && moveY <= 0) { //检查下边界
            moveY = 0
          }
          if ((this.data.imgTop + moveY) >= 0 && moveY >= 0) { //检查上边界
            moveY = 0
          }
          if ((this.data.imgLeft + moveX) >= 0 && moveX >= 0) { //检查左边界
            moveX = 0
          }
          if (this.data.clientHeight >= (this.data.scaleWidth + this.data.imgLeft + moveX) && moveX <= 0) { //检查右边界
            moveX = 0
          }
          this.setData({
            imgLeft: this.data.imgLeft + moveX,  //当前图片位置加上当前移动的偏移量
            imgTop: this.data.imgTop + moveY,
            moveX: e.touches[0].clientX,  //保存当前触摸坐标
            moveY: e.touches[0].clientY
          })
        }
        

        // if (moveX >-1.1 && moveX <1.1){ //过滤触摸抖动X轴
        //   moveX = 0
        // }

        // if (moveY > -1.1 && moveY < 1.1) { //过滤触摸抖动Y轴
        //   moveY = 0
        // }
    
        
        return
      }
      if (e.touches.length == 2){ //双手指移动计算两个手指坐标和距离
        //双手指运动 x移动后的坐标和y移动后的坐标
        let xMove = e.touches[1].clientX - e.touches[0].clientX;
        let yMove = e.touches[1].clientY - e.touches[0].clientY;
        //双手指运动新的 ditance  勾股定理
        let distance = Math.sqrt(xMove * xMove + yMove * yMove);
        //计算移动的过程中实际移动了多少的距离
        let distanceDiff = distance - this.data.distance;
        let newScale = this.data.scale + 0.002 * distanceDiff * this.data.scale

        let scaleWidth = newScale * this.data.baseWidth
        let scaleHeight = newScale * this.data.baseHeight

        if (this.data.baseWidth>=this.data.baseHeight && scaleWidth <= this.data.clientWidth) {          
          return
        }

        if (this.data.baseWidth < this.data.baseHeight && scaleHeight <= this.data.clientHeight) {
          return
        }

        if (scaleWidth >= (this.data.baseWidth * this.properties.maxscale)) {       
          return
        }
        let left = this.data.imgLeft
        let top = this.data.imgTop
       
        let target_left = left - (scaleWidth - this.data.scaleWidth) /2   /*  left - 0.5 * distanceDiff //* this.data.scale //目标left */
        let target_top = top - (scaleHeight - this.data.scaleHeight) / 2 /* top - 0.5 * distanceDiff //* this.data.scale// 目标top */

        if (target_left<=0){  //当left<0
          left = target_left
        }

        if (target_top<=0){
          top = target_top
        }
        


        if (this.data.baseWidth>=this.data.baseHeight){      
          if (this.data.clientWidth >= (left + scaleWidth) && left<0) { //缩放时固定右边界
           left = this.data.clientWidth - (left + scaleWidth) + left  
          }
         
          if (this.data.clientHeight >= (top + scaleHeight)) {  //如果图片下边界到达容器下边界 
            top = this.data.clientHeight - (top + scaleHeight) + top  //缩放时固定下边界
            if (top > 0) { //固定上边界
              top = 0
            }
          }
          if ((this.data.clientHeight >= scaleHeight && top >= 0)) { //图片比容器尺寸小时,向中心收缩
            top = this.data.clientHeight / 2 - (scaleHeight + top) / 2 
          } else { //图片比容器大时
            if (distanceDiff > 0) { //放大时 
              top = target_top
            } else {
              if (this.data.clientHeight < scaleHeight && (this.data.clientHeight < scaleHeight + top) && (top < 0)) { //缩小时要判断边界和容器对于图片的大小
                top = target_top               
              }
              if (top >= 0) { //固定上边界
                top = 0
              }
            }
          }
        }else{
          if (this.data.clientWidth >= (left + scaleWidth) && left < 0) { //缩放时固定右边界
            left = this.data.clientWidth - (left + scaleWidth) + left
          }

          if (this.data.clientHeight >= (top + scaleHeight)) { //缩放时固定下边界
            top = this.data.clientHeight - (top + scaleHeight) + top
            if (top > 0) { //固定上边界
              top = 0
            }
          }
          if ((this.data.clientWidth>=scaleWidth && left>=0))
          {
            left = target_left // this.data.clientWidth/2 - this.data.scaleWidth/2 
          }
        }
        this.setData({
          'distance': distance,
          'scale': newScale,
          'scaleWidth': scaleWidth,
          'scaleHeight': scaleHeight,
          'diff': distanceDiff,
          imgLeft: left,
          imgTop: top
        })

      } 
    }
  //method end
  }
})
