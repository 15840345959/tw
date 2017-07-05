var util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader");

//上传图片计数
var upload_count = 0;

// 初始化七牛相关参数
function initQiniu() {
  var options = {
    region: 'ECN', // 华东区
    uptoken: qnToken
  };
  qiniuUploader.init(options);
}

var qnToken = "";

var vm = null
//获取应用实例
var app = getApp()

Page({
  data: {
    twInfo: {},
    twStepInfos: [] //其中type代表文字/图片 text文字 image图片 
  },

  //初次加载执行逻辑
  init: function () {

  },
  //加载完毕
  onLoad: function (options) {
    vm = this
    //获取接入参数
    console.log("onLoad options:" + JSON.stringify(options));
    //如果paths不为空
    if (!util.judgeIsAnyNullStr(options.paths)) {
      var paths = JSON.parse(options.paths);
      console.log("paths:" + JSON.stringify(paths))
      //设置页面
      var twInfoObj = {}
      twInfoObj.img_s = paths[0];
      var twInfoStepsObj = [];
      for (var i = 0; i < paths.length; i++) {
        var stepObj = {}
        stepObj.img_s = paths[i]
        stepObj.type = "image"
        twInfoStepsObj.push(stepObj)
      }
      vm.setData({
        twInfo: twInfoObj,
        twStepInfos: twInfoStepsObj
      })
    }

    //如果twDetaiInfo不为空
    if (!util.judgeIsAnyNullStr(options.twDetailInfo)) {
      var twDetailInfo = JSON.parse(options.twDetailInfo);
      console.log("twDetailInfo:" + JSON.stringify(twDetailInfo))
      //设置页面
      var twInfoObj = twDetailInfo.twInfo
      twInfoObj.img_s = util.qiniuUrlTool(twInfoObj.img, "folder_index")
      //音乐信息
      if (!util.judgeIsAnyNullStr(twInfoObj.music_id)) {
        twInfoObj.music_cover = twDetailInfo.musicInfo.coverImgUrl
      }

      var twInfoStepsObj = twDetailInfo.twStepInfos
      for (var i = 0; i < twInfoStepsObj.length; i++) {
        //如果图片为空，代表为文字
        if (util.judgeIsAnyNullStr(twInfoStepsObj[i].img)) {
          twInfoStepsObj[i].type = "text"
        } else {
          twInfoStepsObj[i].type = "image"
          twInfoStepsObj[i].img_s = util.qiniuUrlTool(twInfoStepsObj[i].img, "folder_index")
        }
      }
      console.log("twInfoObj:" + JSON.stringify(twInfoObj) + " twInfoStepsObj:" + JSON.stringify(twInfoStepsObj));
      vm.setData({
        twInfo: twInfoObj,
        twStepInfos: twInfoStepsObj
      })
    }
  },
  //设置图文
  setInputText: function (e) {
    console.log("setInputText e:" + JSON.stringify(e.currentTarget.dataset));
    util.navigateToInput(e.currentTarget.dataset)
  },
  //接收文字信息
  changeInputText: function (e) {
    console.log("changeInputText e:" + JSON.stringify(e));
    //图文标题
    if (e.id == "twInfo_title") {
      var obj = vm.data.twInfo;
      obj.title = e.value;
      vm.setData({
        twInfo: obj
      })
    }

    //步骤说明
    if (e.id.indexOf("step_text") >= 0) {
      var step_index = parseInt(e.id.replace("step_text", ""));
      console.log("step_text:" + step_index);
      obj = vm.data.twStepInfos
      obj[step_index].text = e.value
      vm.setData({
        twStepInfos: obj
      })
    }
  },
  //选择图文封面
  setTWImg: function (e) {
    console.log("setTWImg e:" + JSON.stringify(e))
    var param = {
      count: 1
    }
    util.chooseImage(param, function (res) {
      var twInfoObj = vm.data.twInfo
      twInfoObj.img_s = res.tempFilePaths[0]
      vm.setData({
        twInfo: twInfoObj
      })
    }, null, null);
  },
  //选择步骤图片
  changeStepImg: function (e) {
    console.log("changeStepImg e:" + JSON.stringify(e))

    var step_index = e.currentTarget.dataset.stepImageId
    util.chooseImage({ count: 1 }, function (res) {
      var twStepInfosObj = vm.data.twStepInfos
      twStepInfosObj[step_index].img_s = res.tempFilePaths[0]
      vm.setData({
        twStepInfos: twStepInfosObj
      })
    }, null, null)
  },
  //下拉刷新
  onPullDownRefresh: function () {
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 100)
  },

  //上拉加载
  onReachBottom: function () {
    //console.log('已经触底');
  },
  deltunwen: function (e) {
    var step_index = e.currentTarget.id
    console.log("deltunwen e:" + JSON.stringify(e) + " step_index:" + step_index);
    wx.showModal({
      content: '是否确定删除此段',
      showCancel: true,
      cancelText: "取消",
      cancelColor: "#000000",
      confirmText: "确定",
      confirmColor: "#03a9f4",
      success: function (res) {
        if (res.confirm) {
          var twStepInfosObj = vm.data.twStepInfos;
          if (twStepInfosObj.length == 1) {
            util.showToast("至少一篇图文");
            return;
          }
          console.log("step_index:" + step_index + " twStepInfosObj:" + JSON.stringify(twStepInfosObj))
          twStepInfosObj.splice(step_index, 1);

          vm.setData({
            twStepInfos: twStepInfosObj
          })
        }
      }
    });
  },
  //点击添加图文
  addtuwen: function (e) {
    var step_index = e.currentTarget.id
    console.log("deltunwen e:" + JSON.stringify(e) + " step_index:" + step_index);

    //用户选择添加图文/文字
    wx.showActionSheet({
      itemList: ['图文形式', '文字段落'],
      success: function (res) {
        console.log(res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            var param = {
              count: 1
            }
            util.chooseImage(param, function (res) {
              var img_path = res.tempFilePaths[0]
              var stepObj = {}
              stepObj.type = "image"
              stepObj.img_s = img_path
              vm.addStepInfo(stepObj, step_index)
            }, null, null);
            break
          case 1:
            var stepObj = {}
            stepObj.type = "text"
            vm.addStepInfo(stepObj, step_index)
            break
        }

      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })


  },
  //添加图文元素  stepObj图文对象 step_index图文索引
  addStepInfo: function (stepObj, step_index) {
    var twStepInfosObj = vm.data.twStepInfos;
    console.log("twStepInfosObj before:" + JSON.stringify(twStepInfosObj));
    twStepInfosObj.splice(parseInt(step_index) + 1, 0, stepObj)
    console.log("twStepInfosObj after:" + JSON.stringify(twStepInfosObj));
    vm.setData({
      twStepInfos: twStepInfosObj
    })
  },

  //上移图文
  uptunwen: function (e) {
    var step_index = parseInt(e.currentTarget.id)
    console.log("deltunwen e:" + JSON.stringify(e) + " step_index:" + step_index);
    if (step_index == 0) {
      util.showToast('已经置顶')
      return
    }
    util.showLoading('调整顺序')
    var twStepInfosObj = vm.data.twStepInfos
    var reObj = util.clone(twStepInfosObj[step_index - 1])
    twStepInfosObj[step_index - 1] = twStepInfosObj[step_index]
    twStepInfosObj[step_index] = reObj
    vm.setData({
      twStepInfos: twStepInfosObj
    })
    console.log("twStepInfos:" + JSON.stringify(vm.data.twStepInfos))
    util.hideLoading();
  },
  //下移图文
  downtuwen: function (e) {
    var step_index = parseInt(e.currentTarget.id)
    console.log("deltunwen e:" + JSON.stringify(e) + " step_index:" + step_index + " twStepInfos.length:" + vm.data.twStepInfos.length);
    if (step_index == vm.data.twStepInfos.length - 1) {
      util.showToast('已经置底')
      return
    }
    util.showLoading('调整顺序')
    var twStepInfosObj = vm.data.twStepInfos
    console.log("twStepInfos:" + JSON.stringify(vm.data.twStepInfos))
    var reObj = util.clone(twStepInfosObj[parseInt(step_index) + 1])
    console.log("reObj:" + JSON.stringify(reObj))
    console.log("twStepInfosObj[step_index]:" + JSON.stringify(twStepInfosObj[step_index]))
    twStepInfosObj[step_index + 1] = twStepInfosObj[step_index]
    console.log("twStepInfos:" + JSON.stringify(vm.data.twStepInfos) + " reObj:" + JSON.stringify(reObj))
    twStepInfosObj[step_index] = reObj
    console.log("twStepInfos:" + JSON.stringify(vm.data.twStepInfos))
    vm.setData({
      twStepInfos: twStepInfosObj
    })
    console.log("twStepInfos:" + JSON.stringify(vm.data.twStepInfos))
    util.hideLoading();
  },
  //发布图文
  publishTW: function (e) {
    console.log("publishTW e:" + JSON.stringify(e));
    console.log("publishTW twInfo:" + JSON.stringify(vm.data.twInfo));
    console.log("publishTW twStepInfos:" + JSON.stringify(vm.data.twStepInfos));
    //判断图文封面，标题部分
    var twInfoObj = vm.data.twInfo;
    if (util.judgeIsAnyNullStr(twInfoObj.title)) {
      util.showToast('请设置标题');
      return;
    }
    //判断图文步骤
    var twStepInfosObj = vm.data.twStepInfos
    for (var i = 0; i < twStepInfosObj.length; i++) {
      console.log("twStepInfosObj " + i + "  " + JSON.stringify(twStepInfosObj[i]))
      if (util.judgeIsNullImg(twStepInfosObj[i].img_s) && util.judgeIsAnyNullStr(twStepInfosObj[i].text)) {
        util.showToast('请设置图文');
        return;
      }
    }
    //合规校验通过进行上传
    var param = {}
    util.getQnToken(param, function (res) {
      console.log(JSON.stringify(res));
      if (res.data.result) {
        qnToken = res.data.obj;
        console.log("qiniu upload token:" + qnToken)
        initQiniu();
        //获取token成功后创建图文
        vm.createTW()
      }
    }, null);
  },
  //发布图文
  createTW: function (e) {
    util.showLoading("发布图文");
    //进行七牛上传
    //上传封面
    var twInfoObj = vm.data.twInfo
    //仅进行文字更新判断
    var only_modify_text = true;
    if (util.isLocalImg(twInfoObj.img_s)) {
      this.uploadImg(10000)
      only_modify_text = false
    }
    //上传图文
    var twStepInfosObj = vm.data.twStepInfos;
    for (var i = 0; i < twStepInfosObj.length; i++) {
      //如果是本地图片
      if (util.isLocalImg(twStepInfosObj[i].img_s)) {
        this.uploadImg(i)
        only_modify_text = false
      }
    }
    //如果只更新文字，则调用StoreToServer
    if (only_modify_text) {
      vm.storeTWToServer()
    }
  },
  //进行图片上传
  uploadImg: function (e) {
    //upload_count++
    upload_count++
    console.log("uploadImg:" + JSON.stringify(e) + " upload_count:" + upload_count)
    var filePath
    //e>1000代表为封面
    if (e >= 1000) {
      filePath = vm.data.twInfo.img_s;
    } else {
      filePath = vm.data.twStepInfos[e].img_s;
    }

    qiniuUploader.upload(filePath, (res) => {
      console.log("qiniuUploader upload res:" + JSON.stringify(res));
      var img_qn_url = util.getImgRealUrl(res.key);
      console.log("img_qn_url:" + img_qn_url);
      //e>1000代表为封面
      if (e >= 1000) {
        var twInfoObj = vm.data.twInfo
        twInfoObj.img = img_qn_url
        vm.setData({
          twInfo: twInfoObj
        })
      } else {
        var twStepInfosObj = vm.data.twStepInfos
        twStepInfosObj[e].img = img_qn_url
        vm.setData({
          twStepInfos: twStepInfosObj
        })
      }
      //upload_count--
      upload_count--
      console.log("qiniuUploader handle upload_count:" + upload_count);
      //代表全部上传完毕
      if (upload_count == 0) {
        vm.storeTWToServer()
      }
    }, (error) => {
      console.error('error: ' + JSON.stringify(error));
    });
  },
  //服务端保存数据
  storeTWToServer: function (e) {
    console.log("新建作品，调用接口")
    //整理数据
    //图文数据
    var twInfoObj = util.clone(vm.data.twInfo)
    delete twInfoObj.img_s
    delete twInfoObj.music_cover
    //步骤数据
    var twStepInfosObj = [];
    for (var i = 0; i < vm.data.twStepInfos.length; i++) {
      var obj = util.clone(vm.data.twStepInfos[i])
      obj.seq = i
      delete obj.img_s
      twStepInfosObj.push(obj)
    }
    //发布作品
    var param = {
      twInfo: twInfoObj,
      twStepInfos: twStepInfosObj
    }
    //如果twInfoObj的id为空，则为新建
    if (util.judgeIsAnyNullStr(twInfoObj.id)) {
      util.publishTW(param, function (ret) {
        console.log(JSON.stringify(ret))
        if (ret.data.code == '200') {
          var tw_id = ret.data.obj
          //跳转到图文页面
          var targetUrl = util.TW_PAGE + '?id=' + tw_id;
          console.log("onFolderClick targetUrl:" + targetUrl);
          wx.navigateTo({
            url: targetUrl
          })
        }
      });
    } else {
      //更新图文信息
      util.updateTW(param, function (ret) {
        console.log(JSON.stringify(ret))
        if (ret.data.code == '200') {
          var tw_id = ret.data.obj
          //跳转到图文页面
          var targetUrl = util.TW_PAGE + '?id=' + tw_id;
          console.log("onFolderClick targetUrl:" + targetUrl);
          wx.navigateTo({
            url: targetUrl
          })
        }
      });
    }
  },
  //获取音乐
  selectMusic: function (e) {
    console.log(JSON.stringify(e))
    var twInfoObj = vm.data.twInfo
    //music_id==0，代表不设置音乐
    if (e.music_id == "0") {
      delete twInfoObj.music_id
      delete twInfoObj.music_cover
    } else {
      twInfoObj.music_id = e.music_id
      twInfoObj.music_cover = e.music_cover
    }
    vm.setData({
      twInfo: twInfoObj
    })
  },
  //点击选择音乐
  setMusic: function (e) {
    var targetUrl = util.MUSIC_PAGE
    wx.navigateTo({
      url: targetUrl
    })
  },
  //选择设置
  selectSetting: function (e) {
    console.log("selectSetting" + JSON.stringify(e))
    var twInfoObj = vm.data.twInfo
    if (!util.judgeIsAnyNullStr(e.fcomm_flag)) {
      twInfoObj.fcomm_flag = e.fcomm_flag
    }
    if (!util.judgeIsAnyNullStr(e.pri_flag)) {
      twInfoObj.pri_flag = e.pri_flag
    }
    if (!util.judgeIsAnyNullStr(e.type)) {
      twInfoObj.type = e.type
    }
    vm.setData({
      twInfo: twInfoObj
    })
    console.log(JSON.stringify(vm.data.twInfo))
  },
  //点击个性化设置
  setSetting: function (e) {
    console.log("setSetting e:" + JSON.stringify(e))
    wx.navigateTo({
      url: util.TWSeting_PAGE + "?twInfo=" + JSON.stringify(vm.data.twInfo)
    })
  }
});
