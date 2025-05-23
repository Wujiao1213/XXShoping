var util = require('../../utils/util.js');
var api = require('../../config/api.js');

var app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    availableCouponLength: 0, // 可用的优惠券数量
    goodsTotalPrice: 0.00, //商品总价
    freightPrice: 0.00, //快递费
    couponPrice: 0.00, //优惠券的价格
    grouponPrice: 0.00, //团购优惠价格
    orderTotalPrice: 0.00, //订单总价
    actualPrice: 0.00, //实际需要支付的总价
    cartId: 0,
    addressId: 0,
    couponId: 0,
    message: '',
    grouponLinkId: 0, //参与的团购，如果是发起则为0
    grouponRulesId: 0 //团购规则ID
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },

  //获取checkou信息
  getCheckoutInfo: function() {
    let that = this;
    const cartCollection = db.collection('cart');
    cartCollection
      .where({
        _openid: app.globalData.OPENID,
        checked: true
      })
      .get()
      .then(res => {
        // 计算总金额
        const total = res.data.reduce((sum, item) => {
          return sum + item.price;
        }, 0);

        that.setData({
          checkedGoodsList: res.data,
          goodsTotalPrice: total,
          actualPrice: total
        })

        wx.hideLoading();
      })

    const addressCollection = db.collection('address');
    addressCollection
      .where({
        _openid : app.globalData.OPENID,
        id : wx.getStorageSync('addressId')
      })
      .get()
      .then(res => {
        that.setData({
          checkedAddress:res.data[0]
        })
      })

    // util.request(api.CartCheckout, {
    //   cartId: that.data.cartId,
    //   addressId: that.data.addressId,
    //   couponId: that.data.couponId,
    //   grouponRulesId: that.data.grouponRulesId
    // }).then(function(res) {
    //   if (res.errno === 0) {
    //     that.setData({
    //       checkedGoodsList: res.data.checkedGoodsList,
    //       checkedAddress: res.data.checkedAddress,
    //       availableCouponLength: res.data.availableCouponLength,
    //       actualPrice: res.data.actualPrice,
    //       couponPrice: res.data.couponPrice,
    //       grouponPrice: res.data.grouponPrice,
    //       freightPrice: res.data.freightPrice,
    //       goodsTotalPrice: res.data.goodsTotalPrice,
    //       orderTotalPrice: res.data.orderTotalPrice,
    //       addressId: res.data.addressId,
    //       couponId: res.data.couponId,
    //       grouponRulesId: res.data.grouponRulesId,
    //     });
    //   }
    //   wx.hideLoading();
    // });
  },
  selectAddress() {
    wx.navigateTo({
      url: '/pages/ucenter/address/address',
    })
  },
  selectCoupon() {
    wx.navigateTo({
      url: '/pages/ucenter/couponSelect/couponSelect',
    })
  },
  bindMessageInput: function(e) {
    this.setData({
      message: e.detail.value
    });
  },
  onReady: function() {
    // 页面渲染完成

  },
  onShow: function() {
    // 页面显示
    wx.showLoading({
      title: '加载中...',
    });
    try {
      var cartId = wx.getStorageSync('cartId');
      if (cartId) {
        this.setData({
          'cartId': cartId
        });
      }

      var addressId = wx.getStorageSync('addressId');
      if (addressId) {
        this.setData({
          'addressId': addressId
        });
      }

      var couponId = wx.getStorageSync('couponId');
      if (couponId) {
        this.setData({
          'couponId': couponId
        });
      }

      var grouponRulesId = wx.getStorageSync('grouponRulesId');
      if (grouponRulesId) {
        this.setData({
          'grouponRulesId': grouponRulesId
        });
      }

      var grouponLinkId = wx.getStorageSync('grouponLinkId');
      if (grouponLinkId) {
        this.setData({
          'grouponLinkId': grouponLinkId
        });
      }
    } catch (e) {
      // Do something when catch error
      console.log(e);
    }

    this.getCheckoutInfo();
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  submitOrder: function() {
    let that = this;

    if (this.data.addressId <= 0) {
      util.showErrorToast('请选择收货地址');
      return false;
    }

    const order = db.collection('order');
    order
      .add({
        data:{
          goodsList : that.data.checkedGoodsList,
          actualPrice : that.data.actualPrice,
          orderStatusText : '待收货',
          TradingTime : new Date()
        }
      })
      .then( res => {
        // 获取需要删除的购物车商品ID列表
        const cartIds = that.data.checkedGoodsList.map(item => item._id)
        // 批量删除购物车数据
        return wx.cloud.callFunction({
          name: 'deleteCart',
          data: {
            ids: cartIds
          }
        })
      })
      .catch(err => {
        console.log(err)
      })
    
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },
});