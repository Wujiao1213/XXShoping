var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const db = wx.cloud.database();

Page({
  data: {
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    size: 100
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.id) {
      that.setData({
        id: parseInt(options.id)
      });
    }

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });

    this.getCategoryInfo();

  },
  getCategoryInfo: function() {
    let that = this;

    const Collection = db.collection('channel');
    // 2. 查询所有类别
    Collection
      .get()
      .then(res => {
        for(let i=0;i<res.data.length;i++){
          if(res.data[i].id == this.data.id){
            that.setData({
              currentCategory: res.data[i]
            })
          }
        }

        that.setData({
          navList: res.data
        });

        wx.setNavigationBarTitle({
          title: this.data.currentCategory.name
        })

        that.getGoodsList();
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      })

  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    console.log(this.data.id);
  },
  onHide: function() {
    // 页面隐藏
  },

  //获取当前类别的商品
  getGoodsList: function() {

    const Collection = db.collection('Goods');
    Collection
      .where({
        category:this.data.currentCategory.name
      })
      .get()
      .then(res => {
        this.setData({
          goodsList:res.data
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
  onUnload: function() {
    // 页面关闭
  },
  switchCate: function(event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getCategoryInfo();
  }
})