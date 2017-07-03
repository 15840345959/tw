var util = require('../../utils/util.js')

var vm = null

//获取应用实例
var app = getApp()

Page({
  data: {
    inputVal: "", //搜素关键词
    preKeyword: ['知青网', '老有所乐', '营口全知道', '天天吃货'],
    twInfos: [],  //图文列表信息
  },

  onLoad: function (e) {
    console.log('onLoad')
    vm = this
  },
  //进行输入
  inputTyping: function (e) {
    console.log("inputTyping e:" + JSON.stringify(e))
    console.log("e.detail.value.length：" + e.detail.value.length + "  parseInt(vm.data.length):" + parseInt(vm.data.length));
    vm.setData({
      inputVal: e.detail.value
    })
  },
  //点击关键字
  clickKeyword: function (e) {
    console.log(JSON.stringify("clickKeyword e:" + JSON.stringify(e)))
    var keyword = e.currentTarget.dataset.word
    vm.setData({
      inputVal: keyword
    })
    vm.clickSearch()
  },
  //点击搜索
  clickSearch: function (e) {
    console.log("clickSearch e:" + JSON.stringify(e))
    var keyword = vm.data.inputVal
    var param = {
      start: 0,
      num: 12,
      word: keyword,
      style: "base"
    }
    util.showLoading('检索数据')
    util.getTWDetailInfoBySearchWord(param, function (ret) {
      console.log("getTWDetailInfoBySearchWord ret:" + JSON.stringify(ret))
      if (ret.data.code == "200") {
        var twInfosObj = ret.data.obj
        for (var i = 0; i < twInfosObj.length; i++) {
          twInfosObj[i].twInfo.img = util.qiniuUrlTool(twInfosObj[i].twInfo.img, "folder_index")
        }
        vm.setData({
          twInfos: twInfosObj
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
})
