const util = require('../../utils/util.js')

//页面传入信息
var tw_id;

//folder.js
//获取应用实例
var app = getApp()

var vm = null

Page({
  data: {
    defComm: ['必须点个赞', '给予鼓励，回忆我们的青葱岁月', '很喜欢你的故事，点个赞', '我也经历过这段岁月，交个朋友吧', '喜欢喜欢，希望未来可以看到更多的故事', '默默的点个赞'],
    commentText: ""
  },
  onLoad: function (options) {
    console.log("onLoad options:" + JSON.stringify(options));
    //tw_id
    tw_id = options.tw_id;
    vm = this
  },
  bindCommentInput: function (e) {
    console.log("bindCommentInput:" + JSON.stringify(e));
    vm.setData({
      commentText: e.detail.value
    })
  },
  clickDefComm: function (e) {
    console.log("bindCommentInput:" + JSON.stringify(e));
    vm.setData({
      commentText: e.currentTarget.dataset.comment
    })
  },
  clickComment: function (e) {
    console.log("clickComment:" + JSON.stringify(e));
    var param = {
      tw_id: tw_id,
      text: vm.data.commentText
    }
    console.log("clickComment param:" + JSON.stringify(param))
    util.showToast('评论成功')
    util.commentTW(param, function (res) {
      console.log(JSON.stringify(res));
      if (!res.data.result) {
        return;
      }
      vm.setData({
        commentText: ""
      })
      setTimeout(vm.redirectToFolder, 200)
    })
  },
  redirectToFolder: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      prePage.refreshPage('comment')
    }
    util.navigateBack(1);
  },
  initPage: function () {

  }

});