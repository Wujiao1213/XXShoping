// app.js
App({
  globalData: {
    userInfo: null,
    OPENID: ''
  },

  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 云服务器初始化
    wx.cloud.init(
      {
        env:'cloud1-8g3y72iw3f954a76',
        traceUser: true
      }
    )

    // 获取OPENID
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let code = res.code;
        const result = wx.cloud.callFunction({
          name: 'getOpenId',
          data: { code }
        }).then(res => {
          this.globalData.OPENID = res.result.openid;
        })
      }
    })
  },
})
