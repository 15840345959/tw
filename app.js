//app.js
const util = require('./utils/util.js')

var vm = null

App({
  onLaunch: function () {
    vm = this
    //获取用户缓存数据
    var userInfo = wx.getStorageSync("userInfo")
    console.log("local storage userInfo:" + JSON.stringify(userInfo))
    //如果没有缓存
    if (userInfo == null || userInfo == undefined || userInfo == "") {
      //调用登录接口
      vm.login(null)
    } else {
      vm.globalData.userInfo = wx.getStorageSync("userInfo")
      console.log("vm.globalData.userInfo:" + JSON.stringify(vm.globalData.userInfo))
    }
  },
  //登录处理
  login: function (callBack) {
    //通过login获取code，再通过code获取用户openid
    wx.login({
      success: function (res) {
        console.log("wx.login:" + JSON.stringify(res))
        if (res.code) {
          util.getOpenId({ code: res.code }, function (ret) {
            console.log("getOpenId:" + JSON.stringify(ret))
            var openId = ret.data.openid
            var param = {
              wx_id: openId
            }
            vm.loginServer(param)
          }, null)
        }
      }
    })
  },
  //远程调用登录接口
  loginServer: function (e) {
    console.log("loginTW e:" + JSON.stringify(e))
    util.login(e, function (ret) {
      console.log("login:" + JSON.stringify(ret))
      if (ret.data.code == "200") {
        vm.storeUserInfo(ret.data.obj)
        //如果没有头像或者昵称，引导用户进行获取信息
        if (util.judgeIsAnyNullStr(vm.globalData.userInfo.nick_name)
          || util.judgeIsAnyNullStr(vm.globalData.userInfo.avatar)) {
          vm.updateUserInfo(function (ret) {

          })
        }
      }
    }, null)
  },
  //更新用户信息
  updateUserInfo: function (callBack) {
    //获取用户基本信息
    wx.getUserInfo({
      //成功
      success: function (res) {
        console.log("wx.getUserInfo success:" + JSON.stringify(res))
        var param = {
          nick_name: res.userInfo.nickName,
          avatar: res.userInfo.avatarUrl,
          gender: res.userInfo.gender,
          user_id: vm.globalData.userInfo.id,
          token: vm.globalData.userInfo.token
        }
        util.updateUserInfo(param, function (ret, err) {
          console.log("updateUserInfo ret:" + JSON.stringify(ret))
          //更新缓存及globalData
          if (ret.data.code == "200") {
            vm.storeUserInfo(ret.data.obj)
          }
        })
        callBack()
      },
      //失败
      fail: function (res) {
        console.log("wx.getUserInfo fail:" + JSON.stringify(res))
      },
      complete: function (res) {
        console.log("wx.getUserInfo complete:" + JSON.stringify(res))
      }
    })
  },
  //本地存储用户数据
  storeUserInfo: function (obj) {
    console.log("storeUserInfo :" + JSON.stringify(obj))
    wx.setStorage({
      key: "userInfo",
      data: obj
    })
    vm.globalData.userInfo = obj
  },
  //获取用户信息
  getUserInfo: function (cb) {
    typeof cb == "function" && cb(vm.globalData.userInfo)
  },
  //获取系统信息
  getSystemInfo: function (cb) {
    if (vm.globalData.systemInfo) {
      typeof cb == "function" && cb(vm.globalData.systemInfo)
    } else {
      wx.getSystemInfo({
        success: function (res) {
          vm.globalData.systemInfo = res
          console.log("app wx.getSystemInfo:" + JSON.stringify(res))
          typeof cb == "function" && cb(vm.globalData.systemInfo)
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    systemInfo: null
  }
})