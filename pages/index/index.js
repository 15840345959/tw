var util = require('../../utils/util.js')

var vm = null

//开始结束计数
var start = 0
var num = 12

//加载标识
var loadding_flag = false;

//获取应用实例
var app = getApp()
Page({
  data: {
    adInfos: [],  //广告图信息
    twInfos: [],  //图文列表信息
    systemInfo: {},  //系统消息
    searchWord: "", //搜索关键字
    userPage: {},  //用户页面信息
    tab_nav: 0, //下面tab标
  },
  //页面加载
  onLoad: function () {
    console.log('onLoad')
    vm = this
    //初始化sysInfo
    app.getSystemInfo(function (res) {
      console.log("getSystemInfo:" + JSON.stringify(res));
      vm.setData({
        systemInfo: res
      })
    })
    //获取图文信息
    vm.getIndexPage()
  },
  //重新展示
  onShow: function (e) {
    console.log("onShow e:" + JSON.stringify(e))
    //如果显示个人页面
    if(vm.data.tab_nav == '1'){
      vm.getUserPage()
    }
  },
  //点击搜索
  clickSearch: function (e) {
    console.log(JSON.stringify(e))
    var targetUrl = util.SEARCH_PAGE;
    console.log("clickSearch targetUrl:" + targetUrl);
    wx.navigateTo({
      url: targetUrl
    })
  },
  //获取首页图文
  getIndexPage: function (e) {
    var param = {
      start: start,
      num: num,
      con: "recomm"
    }
    util.showLoading("加载数据")
    util.getIndexPage(param, function (ret) {
      // console.log(JSON.stringify(ret))
      if (ret.data.code == "200") {
        //处理广告图片
        var adInfosObj = ret.data.obj.adInfos
        for (var i = 0; i < adInfosObj.length; i++) {
          adInfosObj[i].img = util.qiniuUrlTool(adInfosObj[i].img, "top_ad")
        }
        vm.setData({
          adInfos: adInfosObj
        });
        // console.log("adInfos:" + JSON.stringify(vm.data.adInfos))
        //处理图文信息
        var twInfosObj = ret.data.obj.twDetailInfos
        for (var i = 0; i < twInfosObj.length; i++) {
          twInfosObj[i].twInfo.img = util.qiniuUrlTool(twInfosObj[i].twInfo.img, "folder_index")
        }
        vm.setData({
          twInfos: twInfosObj
        })
        // console.log("twInfos:" + JSON.stringify(vm.data.twInfos))
        start = start + num
      }
    })
  },
  //编辑图文
  editTW: function (e) {
    console.log(JSON.stringify(e))
    var tw_id = e.currentTarget.dataset.twId
    var param = {
      tw_id: tw_id
    }
    util.showLoading('加载数据')
    util.getTWInfoById(param, function (ret) {
      console.log("ret" + JSON.stringify(ret))
      if (ret.data.code == "200") {
        var msgObj = ret.data.obj
        console.log("msgObj:" + JSON.stringify(msgObj))
        wx.navigateTo({
          url: '/pages/paint/paint?twDetailInfo=' + JSON.stringify(msgObj),
        })
      }
    })
  },
  //删除图文
  deleteTW: function (e) {
    console.log(JSON.stringify(e))
    wx.showModal({
      content: '是否确定删除作品',
      showCancel: true,
      cancelText: "取消",
      cancelColor: "#000000",
      confirmText: "确定",
      confirmColor: "#03a9f4",
      success: function (res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index
          var tw_id = e.currentTarget.dataset.twId
          var userPageObj = vm.data.userPage
          console.log("userPageObj:" + JSON.stringify(userPageObj))
          userPageObj.twDetailInfos.splice(index, 1);
          console.log("userPageObj:" + JSON.stringify(userPageObj))
          vm.setData({
            userPage: userPageObj
          })
          util.showToast("删除作品")
          var param = {
            tw_id: tw_id
          }
          console.log("param:" + JSON.stringify(param))
          util.deleteTW(param, function (ret) {
            console.log(ret)
          })
        }
      }
    });
  },
  //获取图文列表
  getTWList: function (e) {
    var param = {
      start: start,
      num: num,
      con: "recomm"
    }
    util.showLoading("加载数据")
    console.log("param:" + JSON.stringify(param))
    util.getTWInfoByCon(param, function (ret) {
      // console.log(JSON.stringify(ret))
      if (ret.data.code == "200") {
        var msgObj = ret.data.obj
        //整理数据
        for (var i = 0; i < msgObj.length; i++) {
          msgObj[i].twInfo.img = util.qiniuUrlTool(msgObj[i].twInfo.img, "folder_index")
        }
        //如果是重新获取数据
        if (start == 0) {
          vm.setData({
            twInfos: msgObj
          })
        } else {
          vm.setData({
            twInfos: vm.data.twInfos.concat(msgObj)
          })
        }
        //设置加载数据
        start = start + num
        loadding_flag = false;
      }
    });
  },
  //点击照相机，进行拍照
  selectImages: function (e) {
    console.log(JSON.stringify(e))
    console.log("userInfo:" + JSON.stringify(app.globalData.userInfo))
    //判断是否有用户头像和昵称
    if (util.judgeIsAnyNullStr(app.globalData.userInfo.nick_name) || util.judgeIsAnyNullStr(app.globalData.userInfo.avatar)) {
      util.navigateToLogin()
      return
    }
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
  },
  //上拉加载更多
  pullUpLoadTW: function (e) {
    //如果在加载，则不进行二次加载
    if (loadding_flag) {
      return;
    }
    loadding_flag = true;
    vm.getTWList()
  },
  //下拉刷新
  pullDownRefresh: function (e) {
    console.log(JSON.stringify(e))
  },
  //页面上拉触底事件
  onReachBottom: function (e) {
    console.log("onReachBottom e:" + JSON.stringify(e))
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
  //点击头像
  onUserClick: function (e) {
    console.log("onUserClick:" + JSON.stringify(e))
    if (!util.judgeIsAnyNullStr(e.currentTarget.dataset.userId)) {
      var targetUrl = util.USER_PAGE + '?id=' + e.currentTarget.dataset.userId;
      console.log("onUserClick targetUrl:" + targetUrl);
      wx.navigateTo({
        url: targetUrl
      })
    }
  },
  //获取用户页面
  getUserPage: function (e) {
    console.log("getUserPage e:" + JSON.stringify(e))
    var param = {
      owner_id: app.globalData.userInfo.id,
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
  //点击下面tab
  clickTab: function (e) {
    console.log("clickTab:" + JSON.stringify(e))
    console.log("e.currentTarget.dataset.tab:" + e.currentTarget.dataset.tab)
    var tab_id = e.currentTarget.dataset.tab;
    //如果切换到个人中心，且个人中心没有头像或者昵称，跳转到登录页面
    if (util.judgeIsAnyNullStr(app.globalData.userInfo.nick_name)
      || util.judgeIsAnyNullStr(app.globalData.userInfo.avatar)) {
      util.navigateToLogin()
    } else {
      vm.setData({
        tab_nav: tab_id
      })
      //如果是第一次获取个人主页
      if (tab_id == 1 && vm.needLoadNewDataAfterSwiper(tab_id)) {
        util.showLoading("加载数据")
        vm.getUserPage()
      }
    }
  },
  //判断切换swiper后是否还需要重新加载数据
  needLoadNewDataAfterSwiper: function (tab_id) {
    console.log("needLoadNewDataAfterSwiper tab_id:" + tab_id)
    switch (parseInt(tab_id)) {
      case 0:
        return vm.data.twInfos.length > 0 ? false : true;
      case 1:
        return util.judgeIsAnyNullStr(vm.data.userPage.userInfo);  //如果userInfo是空，则需要刷新
    }
    return false;
  },
  //分享事件
  onShareAppMessage: function () {
    return {
      title: '分投',
      desc: '分而投之，分享精彩时刻!',
      path: '/pages/index/index'
    }
  },
  //显示粉丝
  showFans: function (e) {
    console.log(JSON.stringify(e))
    var targetUrl = util.FANS_PAGE + "?userInfo=" + JSON.stringify(vm.data.userPage.userInfo);
    console.log("clickSearch targetUrl:" + targetUrl);
    wx.navigateTo({
      url: targetUrl
    })
  },
  //显示关注
  showGZ: function (e) {
    console.log(JSON.stringify(e))
    var targetUrl = util.GZ_PAGE + "?userInfo=" + JSON.stringify(vm.data.userPage.userInfo);
    console.log("clickSearch targetUrl:" + targetUrl);
    wx.navigateTo({
      url: targetUrl
    })
  },
  //点击设置签名
  setInputText: function (e) {
    console.log("setInputText e:" + JSON.stringify(e.currentTarget.dataset));
    util.navigateToInput(e.currentTarget.dataset)
  },
  //接收文字信息
  changeInputText: function (e) {
    console.log("changeInputText e:" + JSON.stringify(e));
    //图文标题
    if (e.id == "userInfo_signature") {
      var obj = vm.data.userPage;
      obj.userInfo.signature = e.value;
      vm.setData({
        userPage: obj
      })
      //后台更新
      var param = {
        signature: e.value
      }
      util.updateUserInfo(param, function (ret) {
        console.log(JSON.stringify(ret))
      })
    }
  },
  //点击反馈
  clickSuggestion: function (e) {
    console.log("clickSuggestion:" + JSON.stringify(e))
    var targetUrl = util.SUGGESTION_PAGE;
    wx.navigateTo({
      url: targetUrl
    })
  }
})
