import Promise from './es6-promise.min'

var TESTMODE = false;

//服务器地址
var SERVER_URL = "https://isart.me";
var DEBUG_URL = "http://localhost";
var SERVER_URL = (TESTMODE) ? DEBUG_URL : SERVER_URL;


///////七牛相关///////////////////////////////////
//根据key值获取图片真实链接
function getImgRealUrl(key_v) {
  return "http://twst.isart.me/" + key_v; //CNAME配置
}


//获取七牛URL，进行图片剪裁
function qiniuUrlTool(img_url, type) {
  if ((img_url == undefined || img_url == null) && type == "head_icon") {
    return "../../images/jiazai.png";
  }
  if (img_url == undefined || img_url == null) {
    return "";
  }
  var pos = img_url.indexOf("?");
  //alert(pos);
  if (pos != -1) {
    img_url = img_url.substr(0, pos);
  }
  var qn_img_url;
  switch (type) {
    case "top_ad":      //广告图片
      qn_img_url = img_url + "?imageView2/2/w/320/h/165/interlace/1";
      break;
    case "folder_index":        //首页图片
      qn_img_url = img_url + "?imageView2/2/w/500/q/75/interlace/1";
      break;
    case "work_step":           //编辑的画夹步骤
      qn_img_url = img_url + "?imageView2/2/w/750/interlace/1";
      break;
    case "user_hi":  //头像
      qn_img_url = img_url + "?imageView2/1/w/200/h/200/interlace/1";
      break;
  }

  return qn_img_url;
}


//跳转到登录页面
function navigateToLogin(param) {
  console.log("navigateToLogin" + JSON.stringify(param));
  wx.navigateTo({
    url: '/pages/login/login?jsonStr=' + JSON.stringify(param),
  })
}

// 获取头像
function getHeadIconA(dir, hi) {
  // console.log(hi);
  if (hi == undefined || hi.length < 15) {
    if (dir == "html") {
      return "../image/default_head_logo.png";
    } else {
      return "../image/default_head_logo.png";
    }
  }
  if (hi.indexOf('7xku37.com') < 0) {
    return hi;
  }
  return qiniuUrlTool(hi, "head_icon");
}

///接口调用相关方法///////////////////////////////////////////

//进行接口调用的基本方法
function wxRequest(url, param, method, successCallback, errorCallback) {
  console.log("wxRequest url:" + JSON.stringify(url) + " param:" + JSON.stringify(param));
  //默认封装globalData中的id和token
  if (!judgeIsAnyNullStr(getApp().globalData.userInfo)) {
    //user_id未设置
    if (judgeIsAnyNullStr(param.user_id)) {
      param.user_id = getApp().globalData.userInfo.id;
    }
    param.token = getApp().globalData.userInfo.token;
  }
  console.log(param)
  wx.request({
    url: url,
    data: param,
    header: {
      "Content-Type": "application/json"
    },
    method: method,
    success: function (res) {
      hideLoading()
      successCallback(res)
    },
    fail: function (err) {
      hideLoading()
      console.log("wxRequest fail:" + JSON.stringify(err));
    }
  });
}


///接口调用相关方法///////////////////////////////////////////
//获取七牛上传token
function getQnToken(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getUploadToken.do', param, "GET", successCallback, errorCallback);
}

//根据owner_id获取图文列表
function getTWInfoListByOwnerId(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getTWDetailInfoByOwnerId.do', param, "GET", successCallback, errorCallback);
}

//获取用户的OpenId
function getOpenId(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getOpenIdForXCX.do', param, "GET", successCallback, errorCallback);
}


//用户登录
function login(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/login.do', param, "GET", successCallback, errorCallback);
}

//更新用户信息
function updateUserInfo(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/updateUserInfo.do', param, "GET", successCallback, errorCallback);
}

//上传图文
function publishTW(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/createTWBaseInfo.do', param, "POST", successCallback, errorCallback);
}

//更新图文
function updateTW(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/updateTWBaseInfo.do', param, "POST", successCallback, errorCallback);
}

//根据图文id获取图文详情
function getTWInfoById(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getTWDetailInfoById.do', param, "GET", successCallback, errorCallback);
}

//评论图文
function commentTW(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/commentTW.do', param, "GET", successCallback, errorCallback);
}

//点赞图文
function praiseTW(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/praiseTW.do', param, "GET", successCallback, errorCallback);
}

//获取广告图
function getADs(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getADs.do', param, "GET", successCallback, errorCallback);
}

//根据条件获取图文列表
function getTWInfoByCon(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getTWDetailInfoByCon.do', param, "GET", successCallback, errorCallback);
}

//根据首页信息（广告+图文）
function getIndexPage(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getIndexPage.do', param, "GET", successCallback, errorCallback);
}

//获取用户首页信息
function getUserPage(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getUserPage.do', param, "GET", successCallback, errorCallback);
}

//获取音乐列表
function getMusicInfos(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getMusicInfos.do', param, "GET", successCallback, errorCallback);
}


//关注用户
function fansUser(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/fansUser.do', param, "GET", successCallback, errorCallback);
}

//取消关注用户
function cannelFansUser(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/cannelFansUser.do', param, "GET", successCallback, errorCallback);
}


//删除图文
function deleteTW(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/deleteTWById.do', param, "GET", successCallback, errorCallback);
}


//搜索图文By关键字
function getTWDetailInfoBySearchWord(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getTWDetailInfoBySearchWord.do', param, "GET", successCallback, errorCallback);
}

//获取我的粉丝
function getMyFans(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getMyFans.do', param, "GET", successCallback, errorCallback);
}

//获取我的关注
function getMyGuanZhu(param, successCallback, errorCallback) {
  wxRequest(SERVER_URL + '/TWServer/APP/getMyGuanZhu.do', param, "GET", successCallback, errorCallback);
}

/////////基本方法///////////////////////////////////////////
//跳转到inputText页面

// var id = "nick_name"             输入框id
// var title = "用户昵称"             输入框标题
// var value = "我的昵称是变色龙"       输入框的默认值
// var length = 16                    输入框文字长度校验
// var tip = "好的昵称更容易让您记住您"   输入框下方提示
// var plach = "请输入昵称"          输入框提示
// var funName = "changeNickName"   上级页面的方法名

function navigateToInput(param) {
  console.log("navigateToInput" + JSON.stringify(param));
  wx.navigateTo({
    url: '/pages/inputText/inputText?jsonStr=' + JSON.stringify(param),
  })
}

//返回
function navigateBack(delta) {
  wx.navigateBack({
    delta: delta
  })
}


//数字处理
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//判断是否有空字符串
function judgeIsAnyNullStr() {
  if (arguments.length > 0) {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] == null || arguments[i] == "" || arguments[i] == undefined || arguments[i] == "undefined" || arguments[i] == "未设置") {
        return true;
      }
    }
  }
  return false;
}

//判断集合是否为空
function judgeIsNullSet(val) {
  if (JSON.stringify(val) == '{}') {
    return true;
  }
  return false;
}


//获取日期 2017-06-13
function getDateStr(str) {
  if (judgeIsAnyNullStr(str)) {
    return str
  }
  var pos = str.indexOf(' ');
  if (pos < 0) {
    return str
  }
  return str.substr(0, pos)
}

//格式化日期时间
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}


//展示toast
function showToast(msg, img) {
  console.log(img);
  if (judgeIsAnyNullStr(img)) {
    wx.showToast({
      title: msg,
      icon: 'success',
      duration: 1500,
    })
  } else {
    wx.showToast({
      title: msg,
      icon: 'success',
      duration: 1500,
      image: img
    })
  }

}

//展示loadding
function showLoading(msg) {
  if (!wx.canIUse('showLoading')) {
    return;
  }
  wx.showLoading({
    title: msg,
  })
}

//隐藏loadding
function hideLoading() {
  if (!wx.canIUse('hideLoading')) {
    return;
  }
  wx.hideLoading();
}


//优化字符串输出，如果str为空，则返回r_str
function conStr(str, r_str) {
  if (judgeIsAnyNullStr(str)) {
    return r_str;
  }
  return str;
}


//鉴权相关
function convertEnNameToChiName(name) {
  switch (name) {
    case "":
      return "";
    case "":
      return "";
  }
  return name;
}

function judgeIsNullImg(img_url) {
  if (judgeIsAnyNullStr(img_url)) {
    return true
  }
  if (img_url.indexOf('def.png') >= 0) {
    return true
  }
  return false
}

function judgeIsAnyNullStrImp(obj) {
  if (obj.length > 0) {
    for (var i = 0; i < obj.length; i++) {
      var value = obj[i].value;
      var name = obj[i].name;
      if (value == null || value == "" || value == undefined || value == "未设置") {
        showToast("请设置" + convertEnNameToChiName(name), "../../images/close_icon.png");
        return true;
      }
    }
  }
  return false;
}


//是否还有本地图片
function isLocalImg(img) {
  if (judgeIsAnyNullStr(img)) {
    return false;
  }
  if (img.indexOf("wxfile") >= 0) {
    return true;
  }
  return false;
}


///选择图片////////////////////////////////////////////////////////
function chooseImage(param, successCallBack, errorCallBack, completeCallBack) {

  //进行参数配置
  if (judgeIsAnyNullStr(param.count)) {
    param.count = 9
  }
  if (judgeIsAnyNullStr(param.sizeType)) {
    param.sizeType = ['compressed']
  }
  if (judgeIsAnyNullStr(param.sourceType)) {
    param.sourceType = ['album']
  }
  console.log("param :" + JSON.stringify(param))

  wx.chooseImage({
    sizeType: param.sizeType, // 可以指定是原图还是压缩图，默认二者都有
    sourceType: param.sourceType, // 可以指定来源是相册还是相机，默认二者都有
    count: param.count,
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      console.log("wx.chooseImage success:" + JSON.stringify(res))
      successCallBack(res)
    },
    fail: function (res) {
      console.log("wx.chooseImage fail:" + JSON.stringify(res))
      if (typeof errorCallBack == "function") {
        errorCallBack(res)
      }
      errorCallBack(res);
    },
    complete: function (res) {
      console.log("wx.chooseImage complete:" + JSON.stringify(res))
      if (typeof completeCallBack == "function") {
        completeCallBack(res)
      }
    }
  })
}

function clone(myObj) {
  if (typeof (myObj) != 'object') return myObj;
  if (myObj == null) return myObj;

  var myNewObj = new Object();

  for (var i in myObj)
    myNewObj[i] = clone(myObj[i]);

  return myNewObj;
}

function getErrorMsg(error_code) {
  switch (error_code) {
    case "405":
      return "已经点赞"
  }
  return "未知错误";
}

//util.js
function imageUtil(e) {
  var imageSize = {};
  var originalWidth = e.detail.width;//图片原始宽
  var originalHeight = e.detail.height;//图片原始高
  var originalScale = originalHeight / originalWidth;//图片高宽比
  console.log('originalWidth: ' + originalWidth)
  console.log('originalHeight: ' + originalHeight)
  //获取屏幕宽高
  wx.getSystemInfo({
    success: function (res) {
      var windowWidth = res.windowWidth;
      var windowHeight = res.windowHeight;
      var windowscale = windowHeight / windowWidth;//屏幕高宽比
      console.log('windowWidth: ' + windowWidth)
      console.log('windowHeight: ' + windowHeight)
      if (originalScale < windowscale) {//图片高宽比小于屏幕高宽比
        //图片缩放后的宽为屏幕宽
        imageSize.imageWidth = windowWidth;
        imageSize.imageHeight = (windowWidth * originalHeight) / originalWidth;
      } else {//图片高宽比大于屏幕高宽比
        //图片缩放后的高为屏幕高
        imageSize.imageHeight = windowHeight;
        imageSize.imageWidth = (windowHeight * originalWidth) / originalHeight;
      }

    }
  })
  console.log('缩放后的宽: ' + imageSize.imageWidth)
  console.log('缩放后的高: ' + imageSize.imageHeight)
  return imageSize;
}

module.exports = {
  TW_PAGE: "/pages/tw/tw",
  USER_PAGE: "/pages/upage/upage",
  COMMENT_PAGE: "/pages/comment/comment",
  INDEX_PAGE: "/pages/index/index",
  MUSIC_PAGE: "/pages/sMusic/sMusic",
  SEARCH_PAGE: "/pages/search/search",
  TWSeting_PAGE: "/pages/sSetting/sSetting",
  FANS_PAGE: "/pages/fansPage/fansPage",
  GZ_PAGE: "/pages/gzPage/gzPage",
  navigateToInput: navigateToInput,
  navigateToLogin: navigateToLogin,
  showLoading: showLoading,
  hideLoading: hideLoading,
  showToast: showToast,
  navigateBack: navigateBack,
  conStr: conStr,
  clone: clone,
  getDateStr: getDateStr,
  judgeIsAnyNullStr: judgeIsAnyNullStr,
  judgeIsAnyNullStrImp: judgeIsAnyNullStrImp,
  isLocalImg: isLocalImg,
  getImgRealUrl: getImgRealUrl,
  qiniuUrlTool: qiniuUrlTool,
  judgeIsNullImg: judgeIsNullImg,
  imageUtil: imageUtil,
  chooseImage: chooseImage,
  getErrorMsg: getErrorMsg,
  getOpenId: getOpenId,
  getQnToken: getQnToken,
  getUserPage: getUserPage,
  login: login,
  updateUserInfo: updateUserInfo,
  getTWInfoListByOwnerId: getTWInfoListByOwnerId,
  publishTW: publishTW,
  updateTW: updateTW,
  commentTW: commentTW,
  getTWInfoById: getTWInfoById,
  getTWInfoByCon: getTWInfoByCon,
  getIndexPage: getIndexPage,
  praiseTW: praiseTW,
  getADs: getADs,
  fansUser: fansUser,
  cannelFansUser: cannelFansUser,
  deleteTW: deleteTW,
  getMusicInfos: getMusicInfos,
  getTWDetailInfoBySearchWord: getTWDetailInfoBySearchWord,
  getMyFans: getMyFans,
  getMyGuanZhu: getMyGuanZhu
}
