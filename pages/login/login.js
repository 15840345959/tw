var util = require('../../utils/util.js')

var vm = null

//获取应用实例
var app = getApp()
Page({
  data: {

  },

  onLoad: function (e) {
    console.log('onLoad')
    vm = this
    console.log(JSON.stringify(e));
  },

  clickLogin: function (e) {
    console.log(JSON.stringify(e))
    wx.openSetting({
      success: (res) => {
        app.login(function () {
          util.navigateBack(1)
        })
      }
    })
  }
})
