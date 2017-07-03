var util = require('../../utils/util.js')

var vm = null

//获取应用实例
var app = getApp()
Page({
  data: {
    musicInfos: []
  },

  onLoad: function (options) {
    vm = this
    console.log("onLoad");
    vm.getMusicInfos()
  },
  //获取背景音乐
  getMusicInfos: function (e) {
    var param = {

    }
    console.log("param:" + JSON.stringify(param));
    util.showLoading('加载数据')
    util.getMusicInfos(param, function (ret) {
      console.log(JSON.stringify(ret))
      var msgObj = ret.data
      if (msgObj.code == "200") {
        var musicInfosObj = msgObj.obj;
        var noMusic_option = {
          "id": "0",
          "title": "不设置背景音乐"
        }
        musicInfosObj.push(noMusic_option)
        console.log(JSON.stringify(musicInfosObj))
        vm.setData({
          musicInfos: musicInfosObj
        })
      }
    })
  },
  //页面显示
  onsShow: function (e) {

  },
  //选中音乐
  selectMusic: function (e) {
    console.log(JSON.stringify(e))
    var music_id = e.currentTarget.dataset.id
    var music_cover = e.currentTarget.dataset.cover
    console.log("music_id:" + music_id)

    var pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      //关键在这里
      var resultJson = {
        music_id: music_id,
        music_cover: music_cover
      }
      prePage.selectMusic(resultJson)
      util.navigateBack(1);
    }
  }

})
