//app.js
const util = require('./utils/util.js')

App({
  onLaunch: function () {
    //获取用户缓存数据
    var userInfo = wx.getStorageSync("userInfo");
    console.log("local storage userInfo:" + JSON.stringify(userInfo));
    //如果没有缓存
    if (userInfo == null || userInfo == undefined || userInfo == "") {
      //调用登录接口
      this.login(null);
    } else {
      this.globalData.userInfo = wx.getStorageSync("userInfo");
      console.log("this.globalData.userInfo:" + JSON.stringify(this.globalData.userInfo));
    }
  },
  login: function (callBack) {
    var that = this;
    wx.login({
      success: function (res) {
        console.log("wx.login:" + JSON.stringify(res));
        if (res.code) {
          util.getOpenId({ code: res.code }, function (ret) {
            console.log("getOpenId:" + JSON.stringify(ret));
            var openId = ret.data.openid;
            //获取用户基本信息
            wx.getUserInfo({
              success: function (res) {
                console.log("wx.getUserInfo success:" + JSON.stringify(res));
                var param = {
                  nick_name: res.userInfo.nickName,
                  avatar: res.userInfo.avatarUrl,
                  gender: res.userInfo.gender,
                  wx_id: openId
                }
                util.login(param, function (ret) {
                  console.log("login:" + JSON.stringify(ret));
                  that.storeUserInfo(ret.data.obj);
                }, null);
              },
              fail: function (res) {
                console.log("wx.getUserInfo fail:" + JSON.stringify(res));
                var param = {
                  nick_name: "匿名",
                  wx_id: openId
                }
                util.login(param, function (ret) {
                  console.log("login:" + JSON.stringify(ret));
                  that.storeUserInfo(ret.data.obj);
                }, null);
              },
              complete: function (res) {
                console.log("wx.getUserInfo complete:" + JSON.stringify(res));
              }
            })
          }, null);
        }
      }
    })
  },
  storeUserInfo: function (obj) {
    console.log("storeUserInfo :" + JSON.stringify(obj));
    wx.setStorage({
      key: "userInfo",
      data: obj
    });
    this.globalData.userInfo = obj;
  },
  getUserInfo: function (cb) {
    typeof cb == "function" && cb(this.globalData.userInfo)
  },
  getSystemInfo: function (cb) {
    var that = this
    if (that.globalData.systemInfo) {
      typeof cb == "function" && cb(that.globalData.systemInfo)
    } else {
      wx.getSystemInfo({
        success: function (res) {
          that.globalData.systemInfo = res
          typeof cb == "function" && cb(that.globalData.systemInfo)
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    systemInfo: null
  }
})