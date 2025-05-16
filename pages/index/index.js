const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');
const db = wx.cloud.database();

//获取应用实例
const app = getApp();

Page({
  data: {
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    groupons: [],
    floorGoods: [],
    banner: [],
    channel: [],
    coupon: []
  },

  onShareAppMessage: function() {
    return {
      title: 'litemall小程序商场',
      desc: '开源微信小程序商城',
      path: '/pages/index/index'
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getIndexData();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  //获取数据库数据
  getIndexData: function() {
    this.getPanner();
    this.getChannel();
    this.getCouponData();
    this.getGrouponData();
    this.getBrandData();
    this.getNewgoodData();
    this.gethotgoodData();
  },
  onLoad: function(options) {

    // 页面初始化 options为页面跳转所带来的参数
    if (options.scene) {
      //这个scene的值存在则证明首页的开启来源于朋友圈分享的图,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      var scene = decodeURIComponent(options.scene);
      console.log("scene:" + scene);

      let info_arr = [];
      info_arr = scene.split(',');
      let _type = info_arr[0];
      let id = info_arr[1];

      if (_type == 'goods') {
        wx.navigateTo({
          url: '../goods/goods?id=' + id
        });
      } else if (_type == 'groupon') {
        wx.navigateTo({
          url: '../goods/goods?grouponId=' + id
        });
      } else {
        wx.navigateTo({
          url: '../index/index'
        });
      }
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.grouponId) {
      //这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?grouponId=' + options.grouponId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.goodId) {
      //这个goodId的值存在则证明首页的开启来源于分享,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?id=' + options.goodId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.orderId) {
      //这个orderId的值存在则证明首页的开启来源于订单模版通知,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../ucenter/orderDetail/orderDetail?id=' + options.orderId
      });
    }

    this.getIndexData();
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  getCoupon(e) {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }

    let couponId = e.currentTarget.dataset.index
    util.request(api.CouponReceive, {
      couponId: couponId
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({
          title: "领取成功"
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    })
  },

  getPanner(){
    const bannerCollection = db.collection('swiper');
    // 2. 查询所有数据（默认最多20条）
    bannerCollection.get()
      .then(res => {
        console.log('获取成功', res.data)
        this.setData({
          banner: res.data
        })
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  },

  getChannel(){
    const channelCollection = db.collection('channel');
    // 2. 查询分类
    channelCollection.get()
      .then(res => {
        this.setData({
          channel: res.data
        })
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  },

  getCouponData(){
    const channelCollection = db.collection('coupon');
    // 2. 查询优惠券
    channelCollection.get()
      .then(res => {
        this.setData({
          coupon: res.data
        })
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  },

  getGrouponData(){
    const channelCollection = db.collection('groupons');
    // 2. 查询团购
    channelCollection.get()
      .then(res => {
        console.log('获取成功', res.data)
        this.setData({
          groupons: res.data
        })
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  },

  getBrandData(){
    const channelCollection = db.collection('brand');
    // 2. 查询品牌商品数据
    channelCollection.get()
      .then(res => {
        console.log('获取成功', res.data)
        this.setData({
          brands: res.data
        })
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  },

  getNewgoodData(){
    const channelCollection = db.collection('newGood');
    // 2. 查询最新商品数据
    channelCollection.get()
      .then(res => {
        console.log('获取成功', res.data)
        this.setData({
          newGoods: res.data
        })
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  },

  gethotgoodData(){
    const channelCollection = db.collection('hotGoods');
    // 2. 查询最热门商品数据
    channelCollection.get()
      .then(res => {
        console.log('获取成功', res.data)
        this.setData({
          hotGoods: res.data
        })
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })
  }
})