var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');

var app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    cartGoods: [],
    cartTotal: {
      "goodsCount": 0,
      "goodsAmount": 0.00,
      "checkedGoodsCount": 0,
      "checkedGoodsAmount": 0.00
    },
    isEditCart: false,
    checkedAllStatus: true,
    editCartList: [],
    hasLogin: false
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function() {
    // 页面渲染完成
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getCartList();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onShow: function() {
    // 页面显示
    if (app.globalData.hasLogin) {
      this.getCartList();
    }

    this.setData({
      hasLogin: app.globalData.hasLogin
    });

  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  goLogin() {
    wx.navigateTo({
      url: "/pages/auth/login/login"
    });
  },
  getCartList: function() {
    let that = this;
    const collection = db.collection('cart');
    collection
    .where({
      _openid: app.globalData.OPENID
    })
    .get()
    .then(res => {
      that.setData({
        cartGoods:res.data
      })

      that.setData({
        checkedAllStatus: that.isCheckedAll()
      });
    })
  },
  isCheckedAll: function() {
    let totalNumber = 0;
    let totalCount = 0.00;
    //判断购物车商品已全选
    this.data.cartGoods.forEach(element => {
      if (element.checked) {
        totalNumber += element.number;
        totalCount += element.price; // 注意：金额应为单价乘以数量
      }
    });
    
    // 判断是否全选（所有商品的 checked 为 true）
    let checkedAll = this.data.cartGoods.every(element => element.checked);
    
    this.setData({
      cartTotal:{
        "goodsCount": 0,
        "goodsAmount": 0.00,
        "checkedGoodsCount": totalNumber,
        "checkedGoodsAmount": totalCount
      }
    });
    
    return checkedAll;
  },
  doCheckedAll: function() {
    let checkedAll = this.isCheckedAll()
    this.setData({
      checkedAllStatus: this.isCheckedAll()
    });
  },
  checkedItem: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let that = this;

    let productIds = [];
    productIds.push(that.data.cartGoods[itemIndex].productId);
    if (!this.data.isEditCart) {
      //处理选中状态切换
      const collection = db.collection('cart');
      collection
        .where({
          _id:that.data.cartGoods[itemIndex]._id
        })
        .update({
          data:{
            checked: !that.data.cartGoods[itemIndex].checked
          }
        })

      const cartGoods = this.data.cartGoods.slice();
      cartGoods[itemIndex].checked = !cartGoods[itemIndex].checked;
      
      that.setData({
        cartGoods: cartGoods
      });
      
      that.setData({
        checkedAllStatus: that.isCheckedAll()
      });
    } else {
      //编辑状态
      let tmpCartData = this.data.cartGoods.map(function(element, index, array) {
        if (index == itemIndex) {
          element.checked = !element.checked;
        }

        return element;
      });

      that.setData({
        cartGoods: tmpCartData,
        checkedAllStatus: that.isCheckedAll(),
        'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()
      });
    }
  },
  getCheckedGoodsCount: function() {
    let checkedGoodsCount = 0;
    this.data.cartGoods.forEach(function(v) {
      if (v.checked === true) {
        checkedGoodsCount += v.number;
      }
    });
    return checkedGoodsCount;
  },
  checkedAll: function() {
    let that = this;

    if (!this.data.isEditCart) {
      var productIds = this.data.cartGoods.map(function(v) {
        return v.productId;
      });
      util.request(api.CartChecked, {
        productIds: productIds,
        isChecked: that.isCheckedAll() ? 0 : 1
      }, 'POST').then(function(res) {
        if (res.errno === 0) {
          console.log(res.data);
          that.setData({
            cartGoods: res.data.cartList,
            cartTotal: res.data.cartTotal
          });
        }

        that.setData({
          checkedAllStatus: that.isCheckedAll()
        });
      });
    } else {
      //编辑状态
      let checkedAllStatus = that.isCheckedAll();
      let tmpCartData = this.data.cartGoods.map(function(v) {
        v.checked = !checkedAllStatus;
        return v;
      });

      that.setData({
        cartGoods: tmpCartData,
        checkedAllStatus: that.isCheckedAll(),
        'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()
      });
    }

  },
  editCart: function() {
    var that = this;
    if (this.data.isEditCart) {
      this.getCartList();
      this.setData({
        isEditCart: !this.data.isEditCart
      });
    } else {
      //编辑状态
      let tmpCartList = this.data.cartGoods.map(function(v) {
        v.checked = false;
        return v;
      });
      this.setData({
        editCartList: this.data.cartGoods,
        cartGoods: tmpCartList,
        isEditCart: !this.data.isEditCart,
        checkedAllStatus: that.isCheckedAll(),
        'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()
      });
    }

  },
  updateCart: function(goodsId, number, price) {
    let that = this;
    const collection = db.collection('cart');
    
    collection
      .where({
        _id:goodsId
      })
      .update({
        data:{
          number: number,
          price: price
        }
      })

    that.setData({
      checkedAllStatus: that.isCheckedAll()
    });
  },
  cutNumber: function(event) {

    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    let number = (cartItem.number - 1 > 1) ? cartItem.number - 1 : 1;
    let price = (cartItem.price / cartItem.number * number).toFixed(2);
    price = parseFloat(price);
    cartItem.number = number;
    cartItem.price = price;
    this.setData({
      cartGoods: this.data.cartGoods
    });

    this.updateCart(cartItem._id, number, price);
  },
  addNumber: function(event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    let number = cartItem.number + 1;
    let price = (cartItem.price / cartItem.number * number).toFixed(2);
    price = parseFloat(price);
    cartItem.number = number;
    cartItem.price = price;
    this.setData({
      cartGoods: this.data.cartGoods
    });

    this.updateCart(cartItem._id, number, price);

  },
  checkoutOrder: function() {
    //获取已选择的商品
    let that = this;

    var checkedGoods = this.data.cartGoods.filter(function(element, index, array) {
      if (element.checked == true) {
        return true;
      } else {
        return false;
      }
    });

    if (checkedGoods.length <= 0) {
      return false;
    }

    // storage中设置了cartId，则是购物车购买
    try {
      wx.setStorageSync('cartId', 0);
      wx.navigateTo({
        url: '/pages/checkout/checkout'
      })
    } catch (e) {}

  },
  deleteCart: function() {
    //获取已选择的商品
    let that = this;

    let productIds = this.data.cartGoods.filter(function(element, index, array) {
      if (element.checked == true) {
        return true;
      } else {
        return false;
      }
    });

    if (productIds.length <= 0) {
      return false;
    }

    productIds = productIds.map(function(element, index, array) {
      if (element.checked == true) {
        return element._id;
      }
    });

    const collection = db.collection('cart');
    const _ = db.command; // 数据库命令构造器
    collection
      .where({
        _id:_.in(productIds)
      })
      .remove()
      .then(res => {
        wx.showToast({
          title: '删除成功',
        })
      })

      this.getCartList();
  }
})