var util = require('../../utils/util.js')

var vm = null

var owner_id;

//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    systemInfo: {},
    userPage: {}
  },

  onLoad: function (options) {
    console.log("onLoad options:" + JSON.stringify(options));
    owner_id = options.id
    // owner_id = 15 //测试用
    vm = this
    //调用应用实例的方法获取全局数据
    //获取用户主页
    vm.getUserPage()
  },

  //页面显示
  onsShow: function (e) {

  },
  //获取用户页面
  getUserPage: function (e) {
    console.log("getUserPage e:" + JSON.stringify(e))
    var param = {
      owner_id: owner_id
    }
    util.getUserPage(param, function (ret) {
      console.log("getUserPage ret:" + JSON.stringify(ret))
      if (ret.data.code == "200") {
        var msgObj = ret.data.obj
        for (var i = 0; i < msgObj.twDetailInfos.length; i++) {
          msgObj.twDetailInfos[i].twInfo.img = util.qiniuUrlTool(msgObj.twDetailInfos[i].twInfo.img, "folder_index")
          msgObj.twDetailInfos[i].twInfo.create_time = util.getDateStr(msgObj.twDetailInfos[i].twInfo.create_time)
        }
        vm.setData({
          userPage: msgObj
        })
      }
    })
  },
  //点击图文
  onTWClick: function (e) {
    console.log("onFolderClick:" + JSON.stringify(e))
    if (!util.judgeIsAnyNullStr(e.currentTarget.dataset.twId)) {
      var targetUrl = util.TW_PAGE + '?id=' + e.currentTarget.dataset.twId;
      console.log("onFolderClick targetUrl:" + targetUrl);
      wx.navigateTo({
        url: targetUrl
      })
    }
  },
  //点击关注
  clickGuanZhu: function (e) {
    console.log("clickGuanZhu e:" + JSON.stringify(e))
    var guanzhu_flag = e.currentTarget.dataset.guanzhuFlag;
    var param = {
      user_id: owner_id,
      fans_id: app.globalData.userInfo.id
    }
    var userPageObj = vm.data.userPage
    userPageObj.guanzhu_flag = !guanzhu_flag
    vm.setData({
      userPage: userPageObj
    })
    //已经关注，则取消关注
    if (guanzhu_flag) {
      util.showToast('取消关注')
      util.cannelFansUser(param, function (ret) {
        console.log(JSON.stringify(ret))
      })
    } else {
      util.showToast('关注成功')
      util.fansUser(param, function (ret) {
        console.log(JSON.stringify(ret))
      })
    }
  }
})
