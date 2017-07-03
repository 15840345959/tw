const util = require('../../utils/util.js')

//tw.js
//获取应用实例
var app = getApp()

var vm = null

//页面传入的图文id
var tw_id = null;

Page({
  data: {
    twInfo: {},   //图文信息
    twStepInfos: [],  //图文步骤信息
    ownerInfo: {},  //作者信息
    musicInfo: {}, //音乐详情
    commentDetailInfos: [], //评论详情
    praise_flag: false,  //点赞标识
    self_flag: false    //是否为自己的作品
  },
  onLoad: function (options) {
    vm = this
    //获取参数
    console.log("onLoad options:" + JSON.stringify(options));
    tw_id = options.id;  //正常获取
    // tw_id = 38  //测试用
    //获取图文详情
    vm.getTWInfoById("all");
  },
  //获取图文详情
  getTWInfoById: function (e) {
    console.log("getTWInfoById e:" + JSON.stringify(e))
    // tw_id
    var param = {
      tw_id: tw_id
    }
    console.log("param:" + JSON.stringify(param));
    util.getTWInfoById(param, function (ret) {
      console.log(JSON.stringify(ret))
      var msgObj = ret.data
      if (msgObj.code == "200") {
        //仅更新评论信息
        if (e == "comment") {
          vm.handleCommentInfos(msgObj)
        }
        //更新全量信息
        if (e == "all") {
          vm.handleTWInfo(msgObj)
          vm.handleMusicInfo(msgObj)
          vm.handleOwnerInfo(msgObj)
          vm.handleTwStepInfos(msgObj)
          vm.handleCommentInfos(msgObj)
        }
        //处理点赞信息
        vm.setData({
          praise_flag: msgObj.obj.praise_flag
        })
        //处理self_flag
        if (vm.data.ownerInfo.id == app.globalData.userInfo.id) {
          vm.setData({
            self_flag: true
          })
        }
      }
    })
  },
  //处理顶部图文
  handleTWInfo: function (msgObj) {
    //处理顶部图文信息
    var twInfoObj = msgObj.obj.twInfo
    console.log("twInfoObj:" + JSON.stringify(twInfoObj))
    twInfoObj.img = util.qiniuUrlTool(twInfoObj.img, "folder_index")
    twInfoObj.create_time = twInfoObj.create_time.substr(0, 10)
    vm.setData({
      twInfo: twInfoObj
    })
  },
  //处理作者信息
  handleOwnerInfo: function (msgObj) {
    //处理头像信息
    var owner_userInfoObj = msgObj.obj.userInfo
    owner_userInfoObj.signature = util.conStr(owner_userInfoObj.signature, "分而投之，分享精彩时刻!");
    vm.setData({
      ownerInfo: owner_userInfoObj
    })
  },
  //处理音乐信息
  handleMusicInfo: function (msgObj) {
    var musicInfoObj = msgObj.obj.musicInfo
    vm.setData({
      musicInfo: musicInfoObj
    })
  },
  //处理图文信息
  handleTwStepInfos: function (msgObj) {
    //处理步骤信息
    var twStepInfosObj = msgObj.obj.twStepInfos
    for (var i = 0; i < twStepInfosObj.length; i++) {
      twStepInfosObj[i].img = util.qiniuUrlTool(twStepInfosObj[i].img, "folder_index")
    }
    vm.setData({
      twStepInfos: twStepInfosObj
    })
  },
  //处理评论信息
  handleCommentInfos: function (msgObj) {
    //处理评论信息
    var commentDetailInfosObj = msgObj.obj.commentDetailInfos
    for (var i = 0; i < commentDetailInfosObj.length; i++) {
      commentDetailInfosObj[i].userInfo.avatar = util.qiniuUrlTool(commentDetailInfosObj[i].userInfo.avatar, "user_hi");
    }
    vm.setData({
      commentDetailInfos: commentDetailInfosObj
    })
  },

  //加载图像
  imageLoad: function (e) {
    console.log("imageLoad e:" + JSON.stringify(e))
    var imageSize = util.imageUtil(e)
    console.log("index:" + e.currentTarget.id)
    var index = parseInt(e.currentTarget.id)
    var obj = vm.data.twStepInfos
    var lr_margin = 30
    obj[index].imageWidth = imageSize.imageWidth - lr_margin //20为左右边距
    obj[index].imageHeight = imageSize.imageHeight * ((imageSize.imageWidth - lr_margin) / imageSize.imageWidth)
    vm.setData({
      twStepInfos: obj
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
  //初始化页面
  initPage: function () {

  },
  //进行分享
  onShareAppMessage: function () {
    return {
      title: vm.data.twInfo.title,
      desc: "我刚刚在分投发布了故事，快来捧捧场吧",
      path: '/pages/tw/tw?id=' + tw_id
    }
  },
  //点击返回
  clickBack: function (e) {
    util.navigateBack(1)
  },
  //点赞
  clickZan: function (e) {
    console.log(JSON.stringify(e))
    var praise_flag = vm.data.praise_flag
    if (praise_flag) {
      util.showToast("已经赞了");
      return;
    }

    var param = {
      tw_id: tw_id,
      opt: "1"
    }
    console.log(JSON.stringify(param))
    util.showToast('点赞成功');
    util.praiseTW(param, function (ret) {
      console.log(JSON.stringify(ret));
      if (ret.data.code == "200") {
        vm.setData({
          praise_flag: true
        });
        vm.setPraiseNum(1);
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
    var targetUrl = util.COMMENT_PAGE + '?tw_id=' + tw_id;
    wx.navigateTo({
      url: targetUrl
    })
  },
  //点击分享
  clickShare: function (e) {
    console.log("clickShare e:" + JSON.stringify(e))
    wx.showShareMenu({
      withShareTicket: false
    })
  },
  //刷新页面
  refreshPage: function (e) {
    vm.getTWInfoById(e);
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
});