const util = require('../../utils/util.js')

//页面传入信息
var tw_id;

//folder.js
//获取应用实例
var app = getApp()

var vm = null

Page({
  data: {
    defSugg: ['想要商务合作，怎么联系', '给予鼓励，告诉小编悄悄话', '应该如何使用图文编辑功能', '我也经历过这段岁月，交个朋友吧', '喜欢喜欢，希望未来可以看到更多的故事', '默默的点个赞'],
    suggestion: ""
  },
  onLoad: function (options) {
    console.log("onLoad options:" + JSON.stringify(options));
    //tw_id
    tw_id = options.tw_id;
    vm = this
  },
  bindsuggestionInput: function (e) {
    console.log("bindsuggestionInput:" + JSON.stringify(e));
    vm.setData({
      suggestion: e.detail.value
    })
  },
  clickDefComm: function (e) {
    console.log("bindsuggestionInput:" + JSON.stringify(e));
    vm.setData({
      suggestion: e.currentTarget.dataset.suggestion
    })
  },
  clicksuggestion: function (e) {
    console.log("clicksuggestion:" + JSON.stringify(e));
    var param = {
      suggestion: vm.data.suggestion
    }
    console.log("clicksuggestion param:" + JSON.stringify(param))
    util.showToast('反馈成功')
    util.createSuggestion(param, function (res) {
      console.log(JSON.stringify(res));
      if (!res.data.result) {
        return;
      }
      vm.setData({
        suggestion: ""
      })
      setTimeout(vm.redirectToRoot, 200)
    })
  },
  redirectToRoot: function () {
    util.navigateBack(1);
  },
  initPage: function () {

  }

});