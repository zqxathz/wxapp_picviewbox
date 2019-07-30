// components/picviewbox/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgsrc:String,
    autorotate:String,
    maxscale: Number 
  },

  /**
   * 组件的初始数据
   */
  data: {
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
    rotateClass: 'img-normal',
    scrollleft:0,
    touchs:0
  },

  lifetimes: {
    ready: function(){
      var that = this;
      wx.createSelectorQuery().in(this).select(".images").boundingClientRect( //获取容器宽高
        function (rect) {         
          that.data.clientWidth = rect.width
          that.data.clientHeight = rect.height
          that.setData({
            dataimg: that.properties.imgsrc//'/static/pics/001.jpg',
          })
        }
      ).exec()
      
      if (this.properties.autorotate.toLowerCase()=='true'){ //启动自动旋转功能
        wx.startDeviceMotionListening({
          interval: 'normal',
          success: (res) => {
            console.log('success')
            wx.onDeviceMotionChange((res) => {
              //console.log(res.gamma)
              if (res.gamma > 50) {
                that.setData({
                  rotateClass: "img-rotate"
                })
              } else {
                that.setData({
                  rotateClass: "img-normal"
                })
              }
            })
          },
          fail: () => {
            console.log('fail')
          }
        })
      }
      
      // wx.createSelectorQuery().in(this).select(".images").scrollOffset(function (res) {
      //   console.log(res)
      //   that.data.scrollleft= res.scrollWidth / 2
      // }).exec()

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
      
      let width,height,left,top,scale = 0
      if (e.detail.width<=e.detail.height){
        width = this.data.clientWidth 
        height = this.data.clientWidth / e.detail.width * e.detail.height
        top  = 0-height/2 + this.data.clientHeight/2
        left = 0 
        scale = height /e.detail.height
      }else{
        width = this.data.clientHeight / e.detail.height * e.detail.width
        height = this.data.clientHeight
        left = 0 - width / 2 + this.data.clientWidth/2
        top = 0
        scale = width / e.detail.width
      }
      
      this.setData({
        'scale': scale,
        'baseWidth': e.detail.width, //获取图片真实宽度
        'baseHeight': e.detail.height, //获取图片真实高度
        'scaleWidth': width,// e.detail.width+'px',//'100%', //给图片设置宽度
        'scaleHeight': height,
        'imgLeft' : left,
        'imgTop' : top
       
        //'scaleHeight': '500px'//e.detail.height+'px', //'100%' //给图片设置高度
      })
      // this.setData({
      //   scrollleft: this.data.scrollleft
      // })
     
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
        let moveX = e.touches[0].clientX - this.data.moveX  //计算当前触摸坐标相对于前一个坐标的值
        let moveY = e.touches[0].clientY - this.data.moveY
       
        if (this.data.clientHeight >= (this.data.scaleHeight + this.data.imgTop+moveY) && moveY<=0) { //检查右边界
          moveY = 0
        }
        if ((this.data.imgTop + moveY) >= 0 && moveY >= 0) { //检查左边界
          moveY=0
        }
        if ((this.data.imgLeft + moveX) >= 0 && moveX >= 0) { //检查上边界
          moveX=0
        } 
        if (this.data.clientWidth>=(this.data.scaleWidth+this.data.imgLeft+moveX) && moveX<=0){ //检查下边界
          moveX = 0
        }
        this.setData({
          imgLeft: this.data.imgLeft+moveX,  //当前图片位置加上当前移动的偏移量
          imgTop: this.data.imgTop + moveY,
          moveX: e.touches[0].clientX,  //保存当前触摸坐标
          moveY: e.touches[0].clientY
        })
        return
      }
      if (e.touches.length == 2){ //双手指移动计算两个手指坐标和距离
        //双手指运动 x移动后的坐标和y移动后的坐标
        let xMove = e.touches[1].clientX - e.touches[0].clientX;
        let yMove = e.touches[1].clientY - e.touches[0].clientY;
        //双手指运动新的 ditance
        let distance = Math.sqrt(xMove * xMove + yMove * yMove);
        //计算移动的过程中实际移动了多少的距离
        let distanceDiff = distance - this.data.distance;
        let newScale = this.data.scale + 0.002 * distanceDiff

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
       
        let target_left = left - 0.5 * distanceDiff //目标left
        let target_top = top - 0.5 * distanceDiff // 目标top

        if (this.data.baseWidth >= this.data.baseHeight && target_left<=0){  //当left<0
          left = target_left
        }

        if (this.data.baseWidth >= this.data.baseHeight && target_top<=0){
          top = target_top
        }
        
        
        
        if (this.data.clientWidth >= (left + scaleWidth)) {
          left = this.data.clientWidth - (left + scaleWidth) + left
        }

        if (this.data.baseWidth>=this.data.baseHeight){      
          if (this.data.clientWidth >= (left + scaleWidth)) {
            left = this.data.clientWidth - (left + scaleWidth) + left
          }    
          if (this.data.clientHeight >= (top + scaleHeight)) {
            top = this.data.clientHeight - (top + scaleHeight) + top
            if (top > 0) {
              top = 0
            }
          }
        }else{
          if (this.data.clientHeight >= (left + scaleHeight)) {
            top = this.data.clientHeight - (top + scaleHeight) + top
          }
          if (this.data.clientWidth >= (top + scaleWidth)) {
            left = this.data.clientWidth - (left + scaleWidth) + left
            if (left > 0) {
              left = 0
            }
          }
        }
        
        if (this.data.baseWidth >= this.data.baseHeight) {        
          if ((this.data.clientHeight >= scaleHeight && top >= 0) ){          
            top = this.data.clientHeight / 2 - (scaleHeight + top) / 2          
          }else{
            if (distanceDiff>0){ //放大时
              top = target_top
            }else{            
                if (this.data.clientHeight < scaleHeight && (this.data.clientHeight < scaleHeight + top) && (top < 0)) { //缩小时要判断边界和容器对于图片的大小
                  top = target_top
                }                        
            }            
          }
        }else{
          if ((this.data.clientWidth >= scaleWidth && left >= 0)) {            
            left = 0 //;this.data.clientWidth / 2 - (scaleWidth) / 2
          } else {           
            if (distanceDiff > 0) { //放大时
              left = target_left
            } else {
              if (this.data.clientWidth < scaleWidth && (this.data.clientWidth < scaleWidth + left) && (top < left)) { //缩小时要判断边界和容器对于图片的大小
                left = target_left
              }
            }
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
