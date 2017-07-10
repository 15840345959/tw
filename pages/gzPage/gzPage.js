var util = require('../../utils/util.js')

var vm = null

var user_id = null

//获取应用实例
var app = getApp()
Page({
  data: {
    fansUserInfo: [], //粉丝信息表
    showTag: 0,   //展示view标识  展示空提示还是关注数据
    self_flag: false  //是否有自己的标识
  },
  //页面加载
  onLoad: function (options) {
    console.log('onLoad option:' + JSON.stringify(options))
    vm = this
    //未传入参数
    if (util.judgeIsAnyNullStr(options.userInfo)) {
      vm.setData({
        showTag: 2
      })
    }
    var userInfo = JSON.parse(options.userInfo);
    console.log("userInfo:" + JSON.stringify(userInfo));
    user_id = userInfo.id
    //设置标题
    wx.setNavigationBarTitle({
      title: userInfo.nick_name + '的关注'
    })
    //如果是自己查看
    if (user_id == app.globalData.userInfo.id) {
      vm.setData({
        self_flag: true
      })
    }
    vm.getMyGuanZhu()
  },
  //获取我的粉丝
  getMyGuanZhu: function (e) {
    var param = {
      user_id: user_id
    }
    util.showLoading("加载数据")
    util.getMyGuanZhu(param, function (ret) {
      console.log(JSON.stringify(ret))
      if (ret.data.code == "200") {
        var msgObj = ret.data.obj
        if (msgObj.length > 0) {
          vm.setData({
            fansUserInfo: msgObj,
            showTag: 1
          })
        } else {
          vm.setData({
            showTag: 2
          })
        }

      }
    })
  },
  //点击头像
  onUserClick: function (e) {
    console.log("onUserClick:" + JSON.stringify(e))
    var user_id = e.currentTarget.dataset.userId
    if (!util.judgeIsAnyNullStr(user_id)) {
      var targetUrl = util.USER_PAGE + '?id=' + user_id;
      console.log("onUserClick targetUrl:" + targetUrl);
      wx.navigateTo({
        url: targetUrl
      })
    }
  },
  //点击取消关注
  onQXGZClick: function (e) {
    console.log("onUserClick:" + JSON.stringify(e))
    var user_id = e.currentTarget.dataset.userId
    if (!util.judgeIsAnyNullStr(user_id)) {
      util.showToast('取消关注');
      var index = vm.getFansUserInfoIndexByUserId(user_id)
      console.log("before:" + JSON.stringify(vm.data.fansUserInfo) + " index:" + index)
      var fansUserInfoObj = vm.data.fansUserInfo
      fansUserInfoObj.splice(index, 1);
      vm.setData({
        fansUserInfo: fansUserInfoObj
      })
      console.log("after:" + JSON.stringify(vm.data.fansUserInfo))
      //如果没有关注，则展示逛首页的提示
      if (vm.data.fansUserInfo.length <= 0) {
        vm.setData({
          showTag: 2
        })
      }
      var param = {
        user_id: user_id,
        fans_id: app.globalData.userInfo.id
      }
      util.cannelFansUser(param, function (ret) {
        console.log(JSON.stringify(ret))
      })
    }
  },
  //根据user_id获取fansUserInfo数组的index
  getFansUserInfoIndexByUserId: function (user_id) {
    console.log("getFansUserInfoIndexByUserId user_id:" + user_id)

    var fansUserInfoObj = vm.data.fansUserInfo
    for (var i = 0; i < fansUserInfoObj.length; i++) {
      if (fansUserInfoObj[i].userInfo.id == user_id) {
        console.log("index i:" + i);
        return i;
      }
    }
    return 0;
  }
})
