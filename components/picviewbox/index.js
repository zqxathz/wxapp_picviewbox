// components/picviewbox/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgsrc:String
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
    rotateClass: 'img-normal',
    scrollleft:0,
    touchs:0
  },

  lifetimes: {
    ready: function(){
      var that = this;
      wx.createSelectorQuery().in(this).select(".images").boundingClientRect(
        function (rect) {
          console.log(rect)
          that.data.clientWidth = rect.width
          that.data.clientHeight = rect.height
          that.setData({
            dataimg: that.properties.imgsrc//'/static/pics/001.jpg',
          })
        }
      ).exec()
      
      wx.startDeviceMotionListening({
        interval:'normal',
        success:(res)=>{
          console.log('success')
          wx.onDeviceMotionChange((res)=>{
            //console.log(res.gamma)
            if (res.gamma>50){
              that.setData({
                rotateClass:"img-rotate"
              })
            }else{
              that.setData({
                rotateClass: "img-normal"
              })
            }
          })
        },
        fail:()=>{
          console.log('fail')
        }
      })

      wx.createSelectorQuery().in(this).select(".images").scrollOffset(function (res) {
        console.log(res)
        that.data.scrollleft= res.scrollWidth / 2
      }).exec()

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
    * 双手指触发开始 计算开始触发两个手指坐标的距离
    */
    touchstartCallback: function (e) {
      // 单手指缩放开始，不做任何处理
      
      if (e.touches.length == 1) {
        this.data.moveX = e.touches[0].clientX
        this.data.moveY = e.touches[0].clientY
        this.data.touchs = 1
        return
      }
      this.data.touchs = 2
      // 当两根手指放上去的时候，将距离(distance)初始化。
      let xMove = e.touches[1].clientX - e.touches[0].clientX;
      let yMove = e.touches[1].clientY - e.touches[0].clientY;
      //计算开始触发两个手指坐标的距离
      let distance = Math.sqrt(xMove * xMove + yMove * yMove);
      this.setData({
        'distance': distance,
      })
    },
    touchendCallback:function(e){
      
      if (e.touches.length == 3) {
        let moveX = e.target.offsetLeft
        let moveY = e.target.offsetTop
        this.setData({
          moveX: e.target.offsetLeft,
          moveY: e.target.offsetTop
        })
        return
      }
    },
    /**
   * 双手指移动   计算两个手指坐标和距离
   */
    touchmoveCallback: function (e) {
      // 单手指缩放不做任何操作
      if (e.touches.length == 1 && this.data.touchs==1) {
      
        let moveX = e.touches[0].clientX - this.data.moveX  //计算当前触摸坐标相对于前一个坐标的值
        let moveY = e.touches[0].clientY - this.data.moveY
       
        if (this.data.clientHeight >= (this.data.scaleHeight + this.data.imgTop+moveY) && moveY<=0) {
          moveY = 0
        }
        if ((this.data.imgTop + moveY)>=0 && moveY>=0){
          moveY=0
        }
        if ((this.data.imgLeft + moveX)>=0 && moveX>=0){
          moveX=0
        } 
        if (this.data.clientWidth>=(this.data.scaleWidth+this.data.imgLeft+moveX) && moveX<=0){
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
      if (scaleWidth<=this.data.clientWidth){
        // scaleWidth = this.data.clientWidth
        // scaleHeight = scaleWidth / this.data.baseWidth * this.data.baseHeight 
        return
      }
      if (scaleWidth >= (this.data.baseWidth*1.5)){
        // scaleWidth = this.data.baseWidth * 1.5
        // sc
        return
      }
      let left = this.data.imgLeft
      let top = this.data.imgTop
      left = (left + this.data.clientWidth)/2 -  (left +scaleWidth)/2
      if (this.data.clientWidth>=(left+scaleWidth)){
        left = this.data.clientWidth - (left + scaleWidth)+left
      }
      if (this.data.clientHeight>=(top+scaleHeight)){
        top= this.data.clientHeight - (top+scaleHeight) + top
        if (top>0) top = 0
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
      // this.setData({
      //   imgLeft:left
      // },()=>{
      //   this.setData({
      //     'distance': distance,
      //     'scale': newScale,
      //     'scaleWidth': scaleWidth,
      //     'scaleHeight': scaleHeight,
      //     'diff': distanceDiff,
      //   })

      // })
        
      // 为了防止缩放得太大，所以scale需要限制，同理最小值也是
      // if (newScale >= 1) {
      //   newScale = 1
      //   let scaleWidth = newScale * this.data.baseWidth + 'px'
      //   let scaleHeight = newScale * this.data.baseHeight + 'px'
      //   this.setData({
      //     'distance': distance,
      //     'scale': newScale,
      //     'scaleWidth': scaleWidth,
      //     'scaleHeight': scaleHeight,
      //     'diff': distanceDiff
      //   })
      // }
      // //为了防止缩放得太小，所以scale需要限制
      // if (newScale <= 0.3) {
      //   newScale = 0.3
      //   this.setData({
      //     'distance': distance,
      //     'scale': newScale,
      //     'scaleWidth': '100%',
      //     'scaleHeight': '100%',
      //     'diff': distanceDiff
      //   })
      // }

      
    }
  //method end
  }
})
