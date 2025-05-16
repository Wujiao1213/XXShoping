var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var check = require('../../../utils/check.js');
const db = wx.cloud.database();

var app = getApp();
Page({
  data: {
    address: {
      id: 0,
      provinceId: 0,
      cityId: 0,
      areaId: 0,
      address: '',
      name: '',
      mobile: '',
      isDefault: false,
      provinceName: '',
      cityName: '',
      areaName: ''
    },
    addressId: 0,
    openSelectRegion: false,
    selectRegionList: [{
        id: 0,
        name: '省份',
        pid: 1,
        type: 1
      },
      {
        id: 0,
        name: '城市',
        pid: 1,
        type: 2
      },
      {
        id: 0,
        name: '区县',
        pid: 1,
        type: 3
      }
    ],
    regionType: 1,
    regionList: [],
    selectRegionDone: false
  },
  bindinputMobile(event) {
    let address = this.data.address;
    address.mobile = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputName(event) {
    let address = this.data.address;
    address.name = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindinputAddress(event) {
    let address = this.data.address;
    address.address = event.detail.value;
    this.setData({
      address: address
    });
  },
  bindIsDefault() {
    let address = this.data.address;
    address.isDefault = !address.isDefault;
    this.setData({
      address: address
    });
  },
  getAddressDetail() {
    let that = this;
    const collection = db.collection('address');
    collection
      .where({
        _openid: app.globalData.OPENID,
        id: parseInt(that.data.addressId)
      })
      .get()
      .then(res => {
        that.setData({
          address: res.data[0]
        })
        delete that.data.address._openid;
        delete that.data.address._id;
      })
  },
  setRegionDoneStatus() {
    let that = this;
    let doneStatus = that.data.selectRegionList.every(item => {
      return item.id != 0;
    });

    that.setData({
      selectRegionDone: doneStatus
    })

  },

  chooseRegion(e) {
    let that = this;

    this.setData({
      'address.provinceName' : e.detail.value[0],
      'address.cityName' : e.detail.value[1],
      'address.areaName' : e.detail.value[2]
    });

    // //设置区域选择数据
    // let address = this.data.address;
    // if (address.provinceId > 0 && address.cityId > 0 && address.areaId > 0) {
    //   let selectRegionList = this.data.selectRegionList;
    //   selectRegionList[0].id = address.provinceId;
    //   selectRegionList[0].name = address.provinceName;
    //   selectRegionList[0].pid = 0;

    //   selectRegionList[1].id = address.cityId;
    //   selectRegionList[1].name = address.cityName;
    //   selectRegionList[1].pid = address.provinceId;

    //   selectRegionList[2].id = address.areaId;
    //   selectRegionList[2].name = address.areaName;
    //   selectRegionList[2].pid = address.cityId;

    //   this.setData({
    //     selectRegionList: selectRegionList,
    //     regionType: 3
    //   });

    //   this.getRegionList(address.cityId);
    // } else {
    //   this.setData({
    //     selectRegionList: [{
    //         id: 0,
    //         name: '省份',
    //         pid: 0,
    //         type: 1
    //       },
    //       {
    //         id: 0,
    //         name: '城市',
    //         pid: 0,
    //         type: 2
    //       },
    //       {
    //         id: 0,
    //         name: '区县',
    //         pid: 0,
    //         type: 3
    //       }
    //     ],
    //     regionType: 1
    //   })
    //   this.getRegionList(0);
    // }

    // this.setRegionDoneStatus();

  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (options.id && options.id != 0) {
      this.setData({
        addressId: options.id
      });
      
      this.getAddressDetail();
    }else{
      this.setAddressID();
    }
  },
  onReady: function() {

  },
  selectRegionType(event) {
    let that = this;
    let regionTypeIndex = event.target.dataset.regionTypeIndex;
    let selectRegionList = that.data.selectRegionList;

    //判断是否可点击
    if (regionTypeIndex + 1 == this.data.regionType || (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].id <= 0)) {
      return false;
    }

    this.setData({
      regionType: regionTypeIndex + 1
    })

    let selectRegionItem = selectRegionList[regionTypeIndex];

    this.getRegionList(selectRegionItem.pid);

    this.setRegionDoneStatus();

  },
  selectRegion(event) {
    let that = this;
    let regionIndex = event.target.dataset.regionIndex;
    let regionItem = this.data.regionList[regionIndex];
    let regionType = regionItem.type;
    let selectRegionList = this.data.selectRegionList;
    selectRegionList[regionType - 1] = regionItem;


    if (regionType != 3) {
      this.setData({
        selectRegionList: selectRegionList,
        regionType: regionType + 1
      })
      this.getRegionList(regionItem.id);
    } else {
      this.setData({
        selectRegionList: selectRegionList
      })
    }

    //重置下级区域为空
    selectRegionList.map((item, index) => {
      if (index > regionType - 1) {
        item.id = 0;
        item.name = index == 1 ? '城市' : '区县';
        item.pid = 0;
      }
      return item;
    });

    this.setData({
      selectRegionList: selectRegionList
    })


    that.setData({
      regionList: that.data.regionList.map(item => {

        //标记已选择的
        if (that.data.regionType == item.type && that.data.selectRegionList[that.data.regionType - 1].id == item.id) {
          item.selected = true;
        } else {
          item.selected = false;
        }

        return item;
      })
    });

    this.setRegionDoneStatus();

  },
  doneSelectRegion() {
    if (this.data.selectRegionDone === false) {
      return false;
    }

    let address = this.data.address;
    let selectRegionList = this.data.selectRegionList;
    address.provinceId = selectRegionList[0].id;
    address.cityId = selectRegionList[1].id;
    address.areaId = selectRegionList[2].id;
    address.provinceName = selectRegionList[0].name;
    address.cityName = selectRegionList[1].name;
    address.areaName = selectRegionList[2].name;

    this.setData({
      address: address,
      openSelectRegion: false
    });

  },
  cancelSelectRegion() {
    this.setData({
      openSelectRegion: false,
      regionType: this.data.regionDoneStatus ? 3 : 1
    });

  },
  getRegionList(regionId) {
    let that = this;
    let regionType = that.data.regionType;
    util.request(api.RegionList, {
      pid: regionId
    }).then(function(res) {
      if (res.errno === 0) {
        that.setData({
          regionList: res.data.map(item => {

            //标记已选择的
            if (regionType == item.type && that.data.selectRegionList[regionType - 1].id == item.id) {
              item.selected = true;
            } else {
              item.selected = false;
            }

            return item;
          })
        });
      }
    });
  },
  cancelAddress() {
    wx.navigateBack();
  },
  saveAddress() {
    let address = this.data.address;

    if (address.name == '') {
      util.showErrorToast('请输入姓名');

      return false;
    }

    if (address.mobile == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }

    if (address.areaName == '') {
      util.showErrorToast('请输入省市区');
      return false;
    }

    if (address.address == '') {
      util.showErrorToast('请输入详细地址');
      return false;
    }

    if (!check.isValidPhone(address.mobile)) {
      util.showErrorToast('手机号不正确');
      return false;
    }

    this.updateAddressDB();
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

  setAddressID(){
    let that = this;
    const collection = db.collection('address');
    collection
      .where({
        _openid: app.globalData.OPENID
      })
      .get()
      .then(res => {
        that.setData({
          'address.id' : res.data.length + 1
        })
      })
  },

  async updateAddressDB(){
    let that = this;
    let region = that.data.address;
    const collection = db.collection('address');

    try{
      if(region.isDefault){
        await collection
          .where({
            _openid:app.globalData.OPENID
          })
          .update({
            data:{
              isDefault : false
            }
          })
      }
  
      if(that.data.addressId && that.data.addressId != 0){
        await collection
          .where({
            _openid: app.globalData.OPENID,
            id: region.id
          })
          .update({
            data: region
          })
      }else{
        await collection
        .add({
          data: region
        })
      }

      wx.navigateBack();
    } catch (err) {
      wx.showToast({
        title: '保存失败',
        icon: "error"
      })
      console.log(err)
    }
  }
})