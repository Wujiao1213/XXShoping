// pages/search-result/search-result.js
Page({
  data: {
    keyword: '',        // 搜索关键词
    productList: [],    // 搜索结果列表
    isLoading: false    // 加载状态
  },

  onLoad(options) {
    const keyword = decodeURIComponent(options.keyword || '')
    this.setData({ keyword })
    this.loadSearchResults(keyword)
  },

  // 执行搜索
  async loadSearchResults(keyword) {
    if (!keyword.trim()) return

    this.setData({ isLoading: true })
    wx.showLoading({ title: '搜索中...' })

    try {
      const db = wx.cloud.database()
      const _ = db.command

      // 云数据库查询（按商品名称模糊匹配）
      const { data } = await db.collection('product')
        .where({
          name: db.RegExp({
            regexp: keyword,
            options: 'i' // 不区分大小写
          })
        })
        .get()

      this.setData({
        productList: data,
        isLoading: false
      })
    } catch (err) {
      console.error('搜索失败:', err)
      wx.showToast({
        title: '搜索失败',
        icon: 'none'
      })
      this.setData({ isLoading: false })
    }

    wx.hideLoading()
  },

  // 输入框事件
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value.trim() })
  },

  // 键盘确认搜索
  onSearchConfirm() {
    this.doSearch()
  },

  // 点击搜索按钮
  doSearch() {
    if (!this.data.keyword) {
      wx.showToast({ title: '请输入关键词', icon: 'none' })
      return
    }
    this.loadSearchResults(this.data.keyword)
  },

  // 跳转商品详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/goods-detail/goods-detail?id=${id}`
    })
  }
})