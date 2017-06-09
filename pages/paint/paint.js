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

var null_step = {
  img_s: "../../images/def.png"
}


Page({
  data: {
    userInfo: {},
    systemInfo: {},
    twInfo: {},
    twStepInfos: []
  },

  //初次加载执行逻辑
  init: function () {

  },
  //加载完毕
  onLoad: function (options) {
    vm = this

    //调用应用实例的方法获取全局数据
    //封装userInfo
    app.getUserInfo(function (res) {
      console.log("getUserInfo:" + JSON.stringify(res))
      vm.setData({
        userInfo: res
      })
      //获取七牛上传token
      var param = {
        token: vm.data.userInfo.token,
        user_id: vm.data.userInfo.id,
      }
      util.getQnToken(param, function (res) {
        console.log(JSON.stringify(res));
        if (res.data.result) {
          qnToken = res.data.obj;
          console.log("qiniu upload token:" + qnToken)
          initQiniu();
        }
      }, null);
    })
    //初始化sysInfo
    app.getSystemInfo(function (res) {
      console.log("getSystemInfo:" + JSON.stringify(res));
      vm.setData({
        systemInfo: res
      })
    })

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
        twInfoStepsObj.push(stepObj)
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
    //图文表
    if (e.id == "twInfo_title") {
      var obj = vm.data.twInfo;
      obj.title = e.value;
      vm.setData({
        twInfo: obj
      })
    }
    //图文说明
    if (e.id == "twInfo_intro") {
      var obj = vm.data.twInfo;
      obj.intro = e.value;
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
    }, 500)
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
  addtuwen: function (e) {
    var step_index = e.currentTarget.id
    console.log("deltunwen e:" + JSON.stringify(e) + " step_index:" + step_index);
    var twStepInfosObj = vm.data.twStepInfos;
    console.log("twStepInfosObj before:" + JSON.stringify(twStepInfosObj));
    twStepInfosObj.splice(parseInt(step_index) + 1, 0, null_step)
    console.log("twStepInfosObj after:" + JSON.stringify(twStepInfosObj));
    vm.setData({
      twStepInfos: twStepInfosObj
    })
  },
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
    util.showLoading("发布图文");
    //进行七牛上传
    //上传封面
    var twInfoObj = vm.data.twInfo
    if (util.isLocalImg(twInfoObj.img_s)) {
      this.uploadImg(10000);
    }
    //上传图文
    var twStepInfosObj = vm.data.twStepInfos;
    for (var i = 0; i < twStepInfosObj.length; i++) {
      //如果是本地图片
      if (util.isLocalImg(twStepInfosObj[i].img_s)) {
        this.uploadImg(i);
      }
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
        console.log("新建作品，调用接口")
        //整理数据
        //图文数据
        var twInfoObj = util.clone(vm.data.twInfo)
        delete twInfoObj.img_s
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
          twStepInfos: twStepInfosObj,
          token: vm.data.userInfo.token,
          user_id: vm.data.userInfo.id,
        }

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

          util.hideLoading();
        });
      }

    }, (error) => {
      console.error('error: ' + JSON.stringify(error));
    });
  }
});
