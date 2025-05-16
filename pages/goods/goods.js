var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var user = require('../../utils/user.js');
const db = wx.cloud.database();

Page({
  data: {
    id: 0,
    goods: {},
    groupon: [], //该商品支持的团购规格
    grouponLink: {}, //参与的团购
    attribute: [],
    issueList: [],
    comment: [],
    brand: {},
    specificationList: [],
    selectedStatus: 0, // 新增选中状态
    isCheak: false,
    productList: [],
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    number: 1,
    checkedSpecText: '规格数量选择',
    tmpSpecText: '请选择规格数量',
    checkedSpecPrice: 0,
    checkedSpecName: '',
    openAttr: false,
    openShare: false,
    noCollectImage: '/static/images/icon_collect.png',
    hasCollectImage: '/static/images/icon_collect_checked.png',
    collectImage: '/static/images/icon_collect.png',
    shareImage: '',
    isGroupon: false, //标识是否是一个参团购买
    soldout: false,
    gallery:[]
  },

  // 页面分享
  onShareAppMessage: function() {
    let that = this;
    return {
      title: that.data.goods.name,
      desc: '唯爱与美食不可辜负',
      path: '/pages/index/index?goodId=' + this.data.id
    }
  },

  shareFriendOrCircle: function() {
    //var that = this;
    if (this.data.openShare === false) {
      this.setData({
        openShare: !this.data.openShare
      });
    } else {
      return false;
    }
  },

  // 保存分享图
  saveShare: function() {
    let that = this;
    wx.downloadFile({
      url: that.data.shareImage,
      success: function(res) {
        console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showModal({
              title: '存图成功',
              content: '图片成功保存到相册了，可以分享到朋友圈了',
              showCancel: false,
              confirmText: '好的',
              confirmColor: '#a78845',
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                }
              }
            })
          },
          fail: function(res) {
            console.log('fail')
          }
        })
      },
      fail: function() {
        console.log('fail')
      }
    })
  },

  //从分享的团购进入
  getGrouponInfo: function(grouponId) {
    let that = this;
    // util.request(api.GroupOnJoin, {
    //   grouponId: grouponId
    // }).then(function(res) {
    //   if (res.errno === 0) {
    //     that.setData({
    //       grouponLink: res.data.groupon,
    //       id: res.data.goods.id
    //     });
    //     //获取商品详情
    //     that.getGoodsInfo();
    //   }
    // });
  },

  // 获取商品信息
  getGoodsInfo() {
    // 查询商品数据
    const Collection = db.collection('Goods');
    Collection
      .where({
        id:this.data.id
      })
      .get()
      .then(res => {
        this.setData({
          goods:res.data[0],
          checkedSpecPrice:res.data[0].countPrice,
          specificationList:res.data[0].specification
        })
        this.getGallery();

        // let _specificationList = res.data.specificationList
        // // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
        // if (_specificationList.length == 1) {
        //   if (_specificationList[0].valueList.length == 1) {
        //     _specificationList[0].valueList[0].checked = true

        //     that.setData({
        //       checkedSpecText: _specificationList[0].valueList[0].value,
        //       tmpSpecText: '已选择：' + _specificationList[0].valueList[0].value,
        //     });
        //   }
        // }

        // that.setData({
        //   goods: res.data.info,
        //   attribute: res.data.attribute,
        //   issueList: res.data.issue,
        //   comment: res.data.comment,
        //   brand: res.data.brand,
        //   specificationList: res.data.specificationList,
        //   productList: res.data.productList,
        //   userHasCollect: res.data.userHasCollect,
        //   shareImage: res.data.shareImage,
        //   checkedSpecPrice: res.data.info.retailPrice,
        //   groupon: res.data.groupon
        // });

        // //如果是通过分享的团购参加团购，则团购项目应该与分享的一致并且不可更改
        // if (that.data.isGroupon) {
        //   let groupons = that.data.groupon;
        //   for (var i = 0; i < groupons.length; i++) {
        //     if (groupons[i].id != that.data.grouponLink.rulesId) {
        //       groupons.splice(i, 1);
        //     }
        //   }
        //   groupons[0].checked = true;
        //   //重设团购规格
        //   that.setData({
        //     groupon: groupons
        //   });

        // }

        // if (res.data.userHasCollect == 1) {
        //   that.setData({
        //     collectImage: that.data.hasCollectImage
        //   });
        // } else {
        //   that.setData({
        //     collectImage: that.data.noCollectImage
        //   });
        // }

        // WxParse.wxParse('goodsDetail', 'html', res.data.info.detail, that);
        // //获取推荐商品
        // //that.getGoodsRelated();
      })
      .catch(err => {
        console.error('获取失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      });

  },

  getGallery(){
    // 查询商品图片
    const Collection = db.collection('images');
    Collection
      .where({
        goods:this.data.goods.name
      })
      .get()
      .then(res => {
        this.setData({
          gallery:res.data
        })
        console.log(this.data.gallery)
      })
    },

  // // 获取推荐商品
  // getGoodsRelated: function() {
  //   let that = this;
  //   util.request(api.GoodsRelated, {
  //     id: that.data.id
  //   }).then(function(res) {
  //     if (res.errno === 0) {
  //       that.setData({
  //         relatedGoods: res.data.goodsList,
  //       });
  //     }
  //   });
  // },

  // // 团购选择
  // clickGroupon: function(event) {
  //   let that = this;

  //   //参与团购，不可更改选择
  //   if (that.data.isGroupon) {
  //     return;
  //   }

  //   let specName = event.currentTarget.dataset.name;
  //   let specValueId = event.currentTarget.dataset.valueId;

  //   let _grouponList = this.data.groupon;
  //   for (let i = 0; i < _grouponList.length; i++) {
  //     if (_grouponList[i].id == specValueId) {
  //       if (_grouponList[i].checked) {
  //         _grouponList[i].checked = false;
  //       } else {
  //         _grouponList[i].checked = true;
  //       }
  //     } else {
  //       _grouponList[i].checked = false;
  //     }
  //   }

  //   this.setData({
  //     groupon: _grouponList,
  //   });
  // },

  // 规格选择
  clickSpec(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
        selectedStatus: index,
        checkedSpecPrice: this.data.specificationList[index].price,
        checkedSpecName: this.data.specificationList[index].name,
        isCheak: true,
    });
  },
  //   let that = this;
  //   let specName = event.currentTarget.dataset.name;
  //   let specValueId = event.currentTarget.dataset.valueId;

  //   //判断是否可以点击

  //   //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
  //   let _specificationList = this.data.specificationList;
  //   for (let i = 0; i < _specificationList.length; i++) {
  //     if (_specificationList[i].name === specName) {
  //       for (let j = 0; j < _specificationList[i].valueList.length; j++) {
  //         if (_specificationList[i].valueList[j].id == specValueId) {
  //           //如果已经选中，则反选
  //           if (_specificationList[i].valueList[j].checked) {
  //             _specificationList[i].valueList[j].checked = false;
  //           } else {
  //             _specificationList[i].valueList[j].checked = true;
  //           }
  //         } else {
  //           _specificationList[i].valueList[j].checked = false;
  //         }
  //       }
  //     }
  //   }
  //   this.setData({
  //     specificationList: _specificationList,
  //   });
  //   //重新计算spec改变后的信息
  //   this.changeSpecInfo();

  //   //重新计算哪些值不可以点击
  // },

  // //获取选中的团购信息
  // getCheckedGrouponValue: function() {
  //   let checkedValues = {};
  //   let _grouponList = this.data.groupon;
  //   for (let i = 0; i < _grouponList.length; i++) {
  //     if (_grouponList[i].checked) {
  //       checkedValues = _grouponList[i];
  //     }
  //   }

  //   return checkedValues;
  // },

  // //获取选中的规格信息
  // getCheckedSpecValue: function() {
  //   let checkedValues = [];
  //   let _specificationList = this.data.specificationList;
  //   for (let i = 0; i < _specificationList.length; i++) {
  //     let _checkedObj = {
  //       name: _specificationList[i].name,
  //       valueId: 0,
  //       valueText: ''
  //     };
  //     for (let j = 0; j < _specificationList[i].valueList.length; j++) {
  //       if (_specificationList[i].valueList[j].checked) {
  //         _checkedObj.valueId = _specificationList[i].valueList[j].id;
  //         _checkedObj.valueText = _specificationList[i].valueList[j].value;
  //       }
  //     }
  //     checkedValues.push(_checkedObj);
  //   }

  //   return checkedValues;
  // },

  // //判断规格是否选择完整
  // isCheckedAllSpec: function() {
  //   return !this.getCheckedSpecValue().some(function(v) {
  //     if (v.valueId == 0) {
  //       return true;
  //     }
  //   });
  // },

  // getCheckedSpecKey: function() {
  //   let checkedValue = this.getCheckedSpecValue().map(function(v) {
  //     return v.valueText;
  //   });
  //   return checkedValue;
  // },

  // // 规格改变时，重新计算价格及显示信息
  // changeSpecInfo: function() {
  //   let checkedNameValue = this.getCheckedSpecValue();

  //   //设置选择的信息
  //   let checkedValue = checkedNameValue.filter(function(v) {
  //     if (v.valueId != 0) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }).map(function(v) {
  //     return v.valueText;
  //   });
  //   if (checkedValue.length > 0) {
  //     this.setData({
  //       tmpSpecText: checkedValue.join('　')
  //     });
  //   } else {
  //     this.setData({
  //       tmpSpecText: '请选择规格数量'
  //     });
  //   }

  //   if (this.isCheckedAllSpec()) {
  //     this.setData({
  //       checkedSpecText: this.data.tmpSpecText
  //     });

  //     // 规格所对应的货品选择以后
  //     let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
  //     if (!checkedProductArray || checkedProductArray.length <= 0) {
  //       this.setData({
  //         soldout: true
  //       });
  //       console.error('规格所对应货品不存在');
  //       return;
  //     }

  //     let checkedProduct = checkedProductArray[0];
  //     if (checkedProduct.number > 0) {
  //       this.setData({
  //         checkedSpecPrice: checkedProduct.price,
  //         soldout: false
  //       });
  //     } else {
  //       this.setData({
  //         checkedSpecPrice: this.data.goods.retailPrice,
  //         soldout: true
  //       });
  //     }

  //   } else {
  //     this.setData({
  //       checkedSpecText: '规格数量选择',
  //       checkedSpecPrice: this.data.goods.retailPrice,
  //       soldout: false
  //     });
  //   }

  // },

  // // 获取选中的产品（根据规格）
  // getCheckedProductItem: function(key) {
  //   return this.data.productList.filter(function(v) {
  //     if (v.specifications.toString() == key.toString()) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });
  // },

  onLoad: function(options) {
    this.initSelection();
    // 页面初始化 options为页面跳转所带来的参数
    if (options.id) {
      this.setData({
        id: parseInt(options.id)
      });

      this.getGoodsInfo();
    }

    //团购
    if (options.grouponId) {
      this.setData({
        isGroupon: true,
      });
      this.getGrouponInfo(options.grouponId);
    }
  },
  onShow: function() {
    // 页面显示
    var that = this;
    if(app.globalData.hasLogin){
      const collection = db.collection('cart');
      collection
        .where({
          _openid: app.globalData.OPENID
        })
        .get()
        .then(res => {
          that.setData({
            cartGoodsCount: res.data.length
          })
        })
    }
    // util.request(api.CartGoodsCount).then(function(res) {
    //   if (res.errno === 0) {
    //     that.setData({
    //       cartGoodsCount: res.data
    //     });
    //   }
    // });
  },

  // //添加或是取消收藏
  // addCollectOrNot: function() {
  //   let that = this;
  //   util.request(api.CollectAddOrDelete, {
  //       type: 0,
  //       valueId: this.data.id
  //     }, "POST")
  //     .then(function(res) {
  //       let _res = res;
  //       if (_res.errno == 0) {
  //         if (_res.data.type == 'add') {
  //           that.setData({
  //             collectImage: that.data.hasCollectImage
  //           });
  //         } else {
  //           that.setData({
  //             collectImage: that.data.noCollectImage
  //           });
  //         }

  //       } else {
  //         wx.showToast({
  //           image: '/static/images/icon_error.png',
  //           title: _res.errmsg,
  //           mask: true
  //         });
  //       }

  //     });

  // },

  // //立即购买（先自动加入购物车）
  // addFast: function() {
  //   var that = this;
  //   if (this.data.openAttr == false) {
  //     //打开规格选择窗口
  //     this.setData({
  //       openAttr: !this.data.openAttr
  //     });
  //   } else {

  //     //提示选择完整规格
  //     if (!this.isCheckedAllSpec()) {
  //       wx.showToast({
  //         image: '/static/images/icon_error.png',
  //         title: '请选择完整规格'
  //       });
  //       return false;
  //     }

  //     //根据选中的规格，判断是否有对应的sku信息
  //     let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
  //     if (!checkedProductArray || checkedProductArray.length <= 0) {
  //       //找不到对应的product信息，提示没有库存
  //       wx.showToast({
  //         image: '/static/images/icon_error.png',
  //         title: '没有库存'
  //       });
  //       return false;
  //     }

  //     let checkedProduct = checkedProductArray[0];
  //     //验证库存
  //     if (checkedProduct.number <= 0) {
  //       wx.showToast({
  //         image: '/static/images/icon_error.png',
  //         title: '没有库存'
  //       });
  //       return false;
  //     }

  //     //验证团购是否有效
  //     let checkedGroupon = this.getCheckedGrouponValue();

  //     //立即购买
  //     util.request(api.CartFastAdd, {
  //         goodsId: this.data.goods.id,
  //         number: this.data.number,
  //         productId: checkedProduct.id
  //       }, "POST")
  //       .then(function(res) {
  //         if (res.errno == 0) {

  //           // 如果storage中设置了cartId，则是立即购买，否则是购物车购买
  //           try {
  //             wx.setStorageSync('cartId', res.data);
  //             wx.setStorageSync('grouponRulesId', checkedGroupon.id);
  //             wx.setStorageSync('grouponLinkId', that.data.grouponLink.id);
  //             wx.navigateTo({
  //               url: '/pages/checkout/checkout'
  //             })
  //           } catch (e) {}

  //         } else {
  //           wx.showToast({
  //             image: '/static/images/icon_error.png',
  //             title: res.errmsg,
  //             mask: true
  //           });
  //         }
  //       });
  //   }


  // },

  //添加到购物车
  addToCart: function() {
    var that = this;
    if (!app.globalData.hasLogin){
      wx.navigateTo({
        url: '/pages/auth/login/login',
      })
      return;
    } 

    if (this.data.openAttr == false) {
      //打开规格选择窗口
      this.setData({
        openAttr: !this.data.openAttr
      });
    } else {
      //提示选择完整规格
      if (!this.data.isCheak) {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: '请选择完整规格'
        });
        return false;
      }

      //添加到购物车
      const addCollection = db.collection('cart');

      //判断是否有同类商品
      addCollection
        .where({
          _openid:app.globalData.OPENID,
          goodsName:this.data.goods.name,
          goodsSpecificationValues: this.data.checkedSpecName
        })
        .get()
        .then(res => {
          if(res.data.length > 0){
            that.updateCart(res.data[0]);
          }else{
            that.addCart();
          }
        })
    }

  },

  addCart(){
    const collection = db.collection('cart');
    collection
      .add({
        data:{
          checked: false,
          goodsName: this.data.goods.name,
          goodsSpecificationValues: this.data.checkedSpecName,
          number: this.data.number,
          picUrl: this.data.goods.picUrl,
          price: this.data.number * this.data.goods.countPrice
        }
      })
      .then(res=>{
        wx.showToast({
          title: '添加成功'
        });
      })
  },

  updateCart(cart){
    let newNumber = cart.number + this.data.number;
    let newPrice = cart.price + this.data.number * this.data.goods.countPrice;
    newPrice = parseFloat(newPrice.toFixed(2))
    console.log(newNumber, newPrice);
    const collection = db.collection('cart');
    collection
      .doc(cart._id)
      .update({
        data:{
          number: newNumber,
          price: newPrice
        }
      })
      .then(res => {
        wx.showToast({
          title: '添加成功'
        });
      })
  },

  cutNumber: function() {
    this.setData({
      number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
    });
  },
  addNumber: function() {
    this.setData({
      number: this.data.number + 1
    });
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  switchAttrPop: function() {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr
      });
    }
  },
  closeAttr: function() {
    this.setData({
      openAttr: false,
    });
  },
  closeShare: function() {
    this.setData({
      openShare: false,
    });
  },
  openCartPage: function() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },
  onReady: function() {
    // 页面渲染完成

  },
  // 下拉刷新
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getGoodsInfo();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  //根据已选的值，计算其它值的状态
  setSpecValueStatus: function() {

  },

  initSelection() {
    const status = this.data.specificationList.map(() => false);
    this.setData({ selectedStatus: status });
  },

})