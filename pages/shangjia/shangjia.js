// pages/shangjia/shangjia.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempFilePaths: [],  // 临时图片路径
    cloudFileIDs: [] 
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 压缩图
      success: res => {
        this.setData({ tempFilePaths: res.tempFilePaths})
        this.uploadImages() // 自动触发上传
      }
    })
  },

  // 上传到云存储
  async uploadImages() {
    wx.showLoading({ title: '上传中...' })
    
    try {
      const uploadTasks = this.data.tempFilePaths.map(filePath => {
        return wx.cloud.uploadFile({
          cloudPath: `product/${Date.now()}-${Math.random().toString().slice(2, 8)}.jpg`,
          filePath
        })
      })

      const results = await Promise.all(uploadTasks)
      this.setData({
        cloudFileIDs: results.map(item => item.fileID)
      })
    } catch (err) {
      console.error('上传失败:', err)
      wx.showToast({ title: '图片上传失败', icon: 'none' })
    }
    
    wx.hideLoading()
  },

  // 表单提交
  async submitForm(e) {
    const { name, price } = e.detail.value

    // 验证数据
    if (!name || !price || this.data.cloudFileIDs.length === 0) {
      return wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
    }

    // 保存到云数据库
    try {
      const db = wx.cloud.database()
      await db.collection('product').add({
        data: {
          name,
          price: parseFloat(price),
          image: this.data.cloudFileIDs[0],
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })

      wx.showToast({ title: '商品已上架' });
      setTimeout(() => wx.navigateBack(), 1500);
      wx.reLaunch({
        url: '/pages/index/index',
      })
    } catch (err) {
      console.error('保存失败:', err)
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  }
})