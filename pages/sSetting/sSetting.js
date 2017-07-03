var util = require('../../utils/util.js')

var vm = null

var typeList = [
  "心情故事",
  "人生感悟",
  "随笔杂记",
  "小诗小调",
  "旅游日记",
  "每日一篇"
]

//获取应用实例
var app = getApp()
Page({
  data: {
    twInfo: {}
  },

  onLoad: function (options) {
    vm = this
    console.log("onLoad options:" + JSON.stringify(options));
    if (!util.judgeIsAnyNullStr(options.twInfo)) {
      var twInfoObj = JSON.parse(options.twInfo);
      vm.setData({
        twInfo: twInfoObj
      })
    }
  },
  //页面显示
  onsShow: function (e) {

  },
  //设置私密flag
  changePri_flag: function (e) {
    console.log("changePri_flag:" + JSON.stringify(e))
    var twInfoObj = vm.data.twInfo
    if (e.detail.value) {
      twInfoObj.pri_flag = "1"
    } else {
      twInfoObj.pri_flag = "0"
    }
    vm.setData({
      twInfo: twInfoObj
    })
    console.log(JSON.stringify(vm.data.twInfo))
  },
  //设置禁止评论flag
  changeFcomm_flag: function (e) {
    console.log("changeFcomm_flag:" + JSON.stringify(e))
    var twInfoObj = vm.data.twInfo
    if (e.detail.value) {
      twInfoObj.fcomm_flag = "1"
    } else {
      twInfoObj.fcomm_flag = "0"
    }
    vm.setData({
      twInfo: twInfoObj
    })
    console.log(JSON.stringify(vm.data.twInfo))
  },
  //点击设置类型
  changeType: function (e) {
    console.log("changeType:" + JSON.stringify(e))
    wx.showActionSheet({
      itemList: typeList,
      success: function (res) {
        console.log(res.tapIndex)
        var twInfoObj = vm.data.twInfo
        twInfoObj.type = typeList[res.tapIndex]
        vm.setData({
          twInfo: twInfoObj
        })
        console.log(JSON.stringify(vm.data.twInfo))
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  //完成设置
  finishSetting: function (e) {
    console.log("finishSetting" + JSON.stringify(e))
    console.log("twInfo:" + JSON.stringify(vm.data.twInfo))
    var pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      var twInfoObj = vm.data.twInfo
      //关键在这里
      var setting = {
        pri_flag: twInfoObj.pri_flag,
        fcomm_flag: twInfoObj.fcomm_flag,
        type: twInfoObj.type
      }
      prePage.selectSetting(setting)
      util.navigateBack(1);
    }
  }
})
