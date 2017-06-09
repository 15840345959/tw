var util = require('../../utils/util.js')

var vm = null

//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    systemInfo: {}
  },

  onLoad: function () {
    console.log('onLoad')
    vm = this
    //调用应用实例的方法获取全局数据
    //封装userInfo
    app.getUserInfo(function (res) {
      console.log("getUserInfo:" + JSON.stringify(res))
      vm.setData({
        userInfo: res
      })

    })
    //初始化sysInfo
    app.getSystemInfo(function (res) {
      console.log("getSystemInfo:" + JSON.stringify(res));
      vm.setData({
        systemInfo: res
      })
    })

  },
  selectImages: function (e) {
    console.log(JSON.stringify(e))
    util.showLoading("选择图片");

    var param = {}
    util.chooseImage(param, function (res) {
      if (res.tempFilePaths.length > 0) {
        var paths = res.tempFilePaths;
        wx.navigateTo({
          url: '/pages/paint/paint?paths=' + JSON.stringify(paths),
        })
      } else {
        util.hideLoading();
        util.showToast("请选择图片");
      }
      util.hideLoading();
    }, function (res) {
      util.hideLoading();
      util.showToast("请选择图片");
    }, null);
  }
})
