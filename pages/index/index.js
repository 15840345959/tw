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
    navbar: ['推荐', '全部', '最新', '最热', '赞榜'],
    currentNavbar: '0',
    swipers: [],  //广告图信息
    userInfo: {},
    systemInfo: {},
    twInfos: [],
    userPage: {},
    tab_nav: 0
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
      //完成用户信息获取后执行
      vm.setADSwiper();
      vm.getTWList();
      vm.getUserPage();
    })
    //初始化sysInfo
    app.getSystemInfo(function (res) {
      console.log("getSystemInfo:" + JSON.stringify(res));
      vm.setData({
        systemInfo: res
      })
    })
  },
  //切换 navbar
  swichNav(e) {
    //判断是否点击了当前的nav
    if (vm.data.currentNavbar == e.currentTarget.dataset.idx) {
      return;
    }

    vm.setData({
      currentNavbar: e.currentTarget.dataset.idx,
    })
    //start变为零
    start = 0;
    vm.getTWList();
  },
  //获取广告图片
  setADSwiper: function () {
    util.getADs({}, function (ret) {
      console.log("getADs:" + JSON.stringify(ret));
      if (ret.data.code == "200") {
        var adsImgs = [];
        var msgObj = ret.data.obj;
        for (var i = 0; i < msgObj.length; i++) {
          var obj = { pic: util.qiniuUrlTool(msgObj[i].img, "top_ad") }
          // var obj = { pic: msgObj[i].img }
          adsImgs.push(obj);
        }
        // console.log("getADs adsImgs:" + JSON.stringify(adsImgs))
        vm.setData({
          swipers: adsImgs
        });
      }
    }, null);
  },
  //获取作品信息
  getTWList: function (e) {
    var param = {
      user_id: vm.data.userInfo.id,
      start: start,
      num: num
    }
    var curr_nav = vm.data.currentNavbar
    console.log("curr_nav:" + curr_nav)
    if (curr_nav == 0) {
      param.con = "recomm"
    }
    if (curr_nav == 1) {
      param.con = "all"
    }
    if (curr_nav == 2) {
      param.con = "new"
    }
    if (curr_nav == 3) {
      param.con = "favor"
    }
    if (curr_nav == 4) {
      param.con = "show"
    }
    console.log("param:" + JSON.stringify(param))
    util.getTWInfoByCon(param, function (ret) {
      console.log(JSON.stringify(ret))
      if (ret.data.code == "200") {
        var msgObj = ret.data.obj;
        //整理数据
        for (var i = 0; i < msgObj.length; i++) {
          msgObj[i].twInfo.img = util.qiniuUrlTool(msgObj[i].twInfo.img, "folder_index")
        }
        var twInfosObj = vm.data.twInfos
        //如果是重新获取数据
        if (start == 0) {
          twInfosObj = []
        }
        for (var i = 0; i < msgObj.length; i++) {
          twInfosObj.push(msgObj[i]);
        }
        vm.setData({
          twInfos: twInfosObj
        })
        start = start + num
        loadding_flag = false;
      }
    });


  },
  //点击照相机，进行拍照
  selectImages: function (e) {
    console.log(JSON.stringify(e))
    console.log("userInfo:" + JSON.stringify(vm.data.userInfo))

    app.getUserInfo(function (res) {
      console.log(JSON.stringify(res))
      vm.setData({
        userInfo: res
      })
      //判断是否有用户头像和昵称
      if (util.judgeIsAnyNullStr(vm.data.userInfo.nick_name) || util.judgeIsAnyNullStr(vm.data.userInfo.avatar)) {
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
    })
  },
  //上拉加载更多
  pullUpLoadTW: function (e) {
    //如果在加载，则不进行二次加载
    if (loadding_flag) {
      return;
    }
    loadding_flag = true;
    vm.getTWList();
  },
  //下拉刷新
  onPullDownRefresh() {
    vm.setADSwiper();
    if (loadding_flag) {
      return;
    }
    loadding_flag = true;
    start = 0
    vm.setData({
      twInfos: []
    })
    vm.getTWList()
    wx.stopPullDownRefresh()
  },
  //分享事件
  onShareAppMessage: function () {
    return {
      title: '知青故事',
      desc: '分享我们的那段青葱岁月!',
      path: '/pages/index/index'
    }
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
  onUserClick: function (e) {
    console.log("onUserClick:" + JSON.stringify(e))
    if (!util.judgeIsAnyNullStr(e.currentTarget.dataset.userId)) {
      var targetUrl = util.USER_PAGE + '?user_id=' + e.currentTarget.dataset.userId;
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
      user_id: vm.data.userInfo.id,
      owner_id: vm.data.userInfo.id,
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
    vm.setData({
      tab_nav: e.currentTarget.dataset.tab
    })

    //如果tab_nav是1的话，即为我的页面，需要更新画夹
    if (vm.data.tab_nav == 1) {
      vm.getUserPage();
    }
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
            user_id: vm.data.userInfo.id,
            token: vm.data.userInfo.token,
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
})
