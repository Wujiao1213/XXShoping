var api = require('../../../config/api.js');
var util = require('../../../utils/util.js');
var user = require('../../../utils/user.js');

var app = getApp();
const db = wx.cloud.database();

Page({
  data:{
    userProFile:{}
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 页面渲染完成

  },
  onReady: function() {

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
  wxLogin: function(e) {

    const userInfo = e.detail.userInfo;

    if (e.detail.userInfo == undefined) {
      app.globalData.hasLogin = false;
      util.showErrorToast('微信登录失败');
      return;
    }

    const collection = db.collection('users');

    wx.login({
      success: (res) => {
        const userUID = res.code;
        // 2. 调用云函数
        //const openId = this.getOpenIdOfCloud(userUID);

        collection
          .where({})
          .get()
          .then(res=>{
            console.log(res.data[0]);
            if(res.data.length > 0){
              //登录
              //存储用户信息至本地
              wx.setStorageSync('userInfo', res.data[0]);
              const address = db.collection('address');
              address
                .where({
                  _openid: app.globalData.OPENID,
                  isDefault : true
                })
                .get()
                .then(res => {
                  wx.setStorageSync('addressId', res.data[0].id)
                })
              //wx.setStorageSync('token', token);
              app.globalData.hasLogin = true;
              wx.navigateBack({ delta: 1 })  // 登录成功后返回上一页
            }else{
              //注册
              this.wxRegister(userInfo);
            }
            
          })
          .catch(error=>{
            console.log("数据库查询失败："+error);
          });
      },
    })
    
    // user.checkLogin().catch(() => {

    //user.loginByWeixin(e.detail.userInfo).then(res => {
          //存储用户信息
          // wx.setStorageSync('userInfo', res.data.userInfo);
          // wx.setStorageSync('token', res.data.token);
    //     app.globalData.hasLogin = true;

    //     wx.navigateBack({
    //       delta: 1
    //     })
    //   }).catch((err) => {
    //     app.globalData.hasLogin = false;
    //     util.showErrorToast('微信登录失败');
    //   });

    // });
  },

  async getOpenIdOfCloud(code) {
    try {
      // 2. 调用云函数
      const res = await wx.cloud.callFunction({
        name: 'getOpenId',
        data: { code }
      })

      // 3. 获取 openid
      const { openid } = res.result
      return openid;
    } catch (err) {
      console.error('获取失败:', err)
    }
  },

  wxRegister(userInfo){
    const collection = db.collection('users');

    //获取微信用户信息
    const username = userInfo.nickName;
    const avatarUrl = userInfo.avatarUrl;
    //存入数据库
    collection.add({
      data:{
      nickName:username,
      avatarUrl:avatarUrl
    },
    success: () => {
      wx.showToast({ title: '提交成功' })
      //存储用户信息至本地
      wx.setStorageSync('userInfo', userInfo);
      //wx.setStorageSync('token', token);
      app.globalData.hasLogin = true;
      wx.navigateBack({ delta: 1 })  // 插入成功后返回上一页
    },
    fail: err => {
      wx.showToast({ title: '提交失败', icon: 'none' })
      console.log(err);
    }})
  },
})