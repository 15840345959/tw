var util = require('../../utils/util.js')

var vm = null

//获取应用实例
var app = getApp()
Page({
  data: {
    id: "id",
    title: "",
    value: "",
    length: "30",
    tip: "",
    plach: "请输入",
    funName: "changeInputText",
    btn: "完成"
  },

  onLoad: function (e) {
    console.log('onLoad')
    vm = this
    console.log(JSON.stringify(e));
    var obj = JSON.parse(e.jsonStr);
    //进行传入参数的赋值
    //id
    if (!util.judgeIsAnyNullStr(obj.id)) {
      vm.setData({
        id: obj.id
      })
    }
    //title
    if (!util.judgeIsAnyNullStr(obj.title)) {
      vm.setData({
        title: obj.title
      })
    }
    //value
    if (!util.judgeIsAnyNullStr(obj.value)) {
      vm.setData({
        value: obj.value
      })
    }
    //length
    if (!util.judgeIsAnyNullStr(obj.length)) {
      vm.setData({
        length: obj.length
      })
    }
    //tip
    if (!util.judgeIsAnyNullStr(obj.tip)) {
      vm.setData({
        tip: obj.tip
      })
    }
    //plach
    if (!util.judgeIsAnyNullStr(obj.plach)) {
      vm.setData({
        plach: obj.plach
      })
    }
    //funName
    if (!util.judgeIsAnyNullStr(obj.funName)) {
      vm.setData({
        funName: obj.funName
      })
    }
    //btn
    if (!util.judgeIsAnyNullStr(obj.btn)) {
      vm.setData({
        btn: obj.btn
      })
    }
  },

  bindInputText: function (e) {
    var that = this
    console.log("bindInputText:" + JSON.stringify(e))
    console.log("e.detail.value.length：" + e.detail.value.length + "  parseInt(vm.data.length):" + parseInt(vm.data.length));
    vm.setData({
      value: e.detail.value
    })

  },
  clickConfirm: function (e) {

    console.log(JSON.stringify(e))
    if (util.judgeIsAnyNullStr(vm.data.value)) {
      util.showToast('请输入文字');
      return;
    }
    var pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      //关键在这里
      var resultJson = {
        id: vm.data.id,
        value: vm.data.value
      }
      prePage.changeInputText(resultJson)
      util.navigateBack(1);
    }
  }
})
