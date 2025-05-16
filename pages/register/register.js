Page({
  data: {
    genders: ['男', '女'],
    genderIndex: -1,
    date: '',
    time: '',
    region: [],
    currentDate: new Date().toISOString().split('T')[0],
    isChecked: false
  },

  genderChange(e) {
    this.setData({ genderIndex: e.detail.value });
  },

  dateChange(e) {
    this.setData({ date: e.detail.value });
  },

  timeChange(e) {
    this.setData({ time: e.detail.value });
  },

  regionChange(e) {
    this.setData({ region: e.detail.value });
  },

  switchChange(e) {
    const isChecked = e.detail.value;
    this.setData({ isChecked });
    wx.showToast({
      title: isChecked ? '已同意协议' : '已取消协议',
      icon: 'none'
    });
  },

  submitForm(e) {
    const formData = {
      ...e.detail.value,
      gender: this.data.genders[this.data.genderIndex],
      birthday: this.data.date,
      registerTime: this.data.time,
      region: this.data.region,
      isAgreed: this.data.isChecked
    };

    console.log('注册信息：', formData);
    wx.showModal({
      title: '注册信息',
      content: JSON.stringify(formData, null, 2),
      showCancel: false
    });

    this.onGetUserInfo(formData);
  },

  // 用户注册
  async onGetUserInfo(formData) {
    try {
      // 获取 openid（通过云函数）
      const { result } = await wx.cloud.callFunction({
        name: 'getOpenId'
      });

      // 写入用户数据
      const db = wx.cloud.database();
      await db.collection('users').add({
        data: {
          ...formData,
          balance: 2000.00,
          updateTime: db.serverDate()
        }
      });

      // 更新本地状态
      wx.setStorageSync('openid', result.openid);
      this.setData({
        isLogin: true,
        userInfo: { ...formData, balance: 2000.00 }
      });

    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },
});