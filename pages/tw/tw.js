const util = require('../../utils/util.js')

//tw.js
//获取应用实例
var app = getApp()

var vm = null

//页面传入的图文id
var tw_id = null;

Page({
  data: {
    userInfo: {},
    systemInfo: {},
    twInfo: {},
    twStepInfos: [],
    ownerInfo: {},
    commentDetailInfos: [],
    praise_flag: false
  },
  onLoad: function (options) {
    console.log("onLoad options:" + JSON.stringify(options));
    //tw_id
    tw_id = options.id;
    // tw_id = 38  //测试用
    vm = this
    //封装userInfo
    app.getUserInfo(function (res) {
      console.log(JSON.stringify(res))
      vm.setData({
        userInfo: res
      })
      if (!util.judgeIsAnyNullStr(res)) {
        //获取图文详情
        vm.getTWInfoById();
      }
    })
    //初始化sysInfo
    app.getSystemInfo(function (res) {
      console.log("getSystemInfo:" + JSON.stringify(res));
      vm.setData({
        systemInfo: res
      })
    })
  },
  //获取图文详情
  getTWInfoById: function (e) {
    // tw_id
    var param = {
      tw_id: tw_id,
      user_id: vm.data.userInfo.id
    }
    console.log("param:" + JSON.stringify(param));
    util.getTWInfoById(param, function (ret) {
      console.log(JSON.stringify(ret))
      var msgObj = ret.data
      if (msgObj.code == "200") {
        //处理顶部图文信息
        var twInfoObj = msgObj.obj.twInfo
        console.log("twInfoObj:" + JSON.stringify(twInfoObj))
        twInfoObj.img = util.qiniuUrlTool(twInfoObj.img, "folder_index")
        twInfoObj.create_time = twInfoObj.create_time.substr(0, 10)
        vm.setData({
          twInfo: twInfoObj
        })
        //处理头像信息
        var owner_userInfoObj = msgObj.obj.userInfo
        vm.setData({
          ownerInfo: owner_userInfoObj
        })
        //处理步骤信息
        var twStepInfosObj = msgObj.obj.twStepInfos
        for (var i = 0; i < twStepInfosObj.length; i++) {
          twStepInfosObj[i].img = util.qiniuUrlTool(twStepInfosObj[i].img, "folder_index")
        }

        vm.setData({
          twStepInfos: twStepInfosObj
        })
        //处理评论信息
        var commentDetailInfosObj = msgObj.obj.commentDetailInfos
        for (var i = 0; i < commentDetailInfosObj.length; i++) {
          commentDetailInfosObj[i].userInfo.avatar = util.qiniuUrlTool(commentDetailInfosObj[i].userInfo.avatar, "user_hi");
        }
        vm.setData({
          commentDetailInfos: commentDetailInfosObj
        })
        //处理点赞信息
        vm.setData({
          praise_flag: msgObj.obj.praise_flag
        })
      }
    })
  },
  //点击图片，进行预览
  clickImg: function (e) {
    console.log(JSON.stringify(e))
    var currentUrl = e.currentTarget.dataset.currUrl;
    var img_arr = [];
    for (var i = 0; i < vm.data.twStepInfos.length; i++) {
      img_arr.push(vm.data.twStepInfos[i].img)
    }
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: img_arr // 需要预览的图片http链接列表
    })

  },

  initPage: function () {

  },
  onShareAppMessage: function () {
    return {
      title: vm.data.twInfo.title,
      desc: "我发布了知青故事，一起来回顾我们的青葱岁月",
      path: '/pages/tw/tw?id=' + tw_id
    }
  },
  clickBack: function (e) {
    util.navigateBack(1)
  },
  clickLogo: function (e) {
    var targetUrl = util.INDEX_PAGE;
    console.log("onFolderClick targetUrl:" + targetUrl);
    wx.navigateTo({
      url: targetUrl
    })
  },
  clickZan: function (e) {
    console.log(JSON.stringify(e))
    var tw_id = e.currentTarget.dataset.folderId
    var praise_flag = e.currentTarget.dataset.zanFlag
    if (praise_flag) {
      util.showToast("已经赞了");
      return;
    }
    // if(vm.data.userInfo.id == vm.data.twInfo.user_id){
    //   util.showToast("不能给自己点赞");
    // }

    var param = {
      user_id: vm.data.userInfo.id,
      token: vm.data.userInfo.token,
      tw_id: tw_id,
      opt: "1"
    }
    console.log(JSON.stringify(param));
    util.praiseTW(param, function (ret) {
      console.log(JSON.stringify(ret));
      if (ret.data.result) {
        vm.setData({
          praise_flag: true
        });
        vm.setPraiseNum(1);
        util.showToast('点赞成功');
      } else {
        util.showToast(util.getErrorMsg(ret.data.code))
      }
    }, null);
  },
  //设置点赞数量
  setPraiseNum: function (num) {
    console.log("setPraiseNum num:" + num);
    var twInfo = vm.data.twInfo
    twInfo.favor_num = parseInt(twInfo.favor_num) + num
    vm.setData({
      twInfo: twInfo
    });
  },
  //进行评论
  clickPingLun: function (e) {
    console.log("clickPingLun:" + JSON.stringify(e))
    var targetUrl = util.COMMENT_PAGE + '?tw_id=' + vm.data.twInfo.id;
    wx.navigateTo({
      url: targetUrl
    })
  },
  //刷新页面
  refreshPage: function (e) {
    vm.getTWInfoById();
  }
});