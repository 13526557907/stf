var assert = require('assert')
var jws = require('jws')
var crypto = require('crypto');
var request = require('request');
var _ = require('lodash') 
var usePhoneName = {};
module.exports.getphoneName = function() {
  return usePhoneName;
}
module.exports.setphoneName = function(inputPhoneName) {
  usePhoneName.name = inputPhoneName;
}
 const baseUrl = "http://fairytest.com";
 // const baseUrl = "http://192.168.0.57:8081";
module.exports.baseUrl = baseUrl;
module.exports.baseUrl2 = "http://fairytest.com";
module.exports.test_des = function (param) {  
  var key = new Buffer(param.key);  
  var iv = new Buffer(param.iv ? param.iv : 0)  
  var plaintext = param.plaintext  
  var alg = param.alg  
  var autoPad = param.autoPad  
    
  //encrypt  
  // var cipher = crypto.createCipheriv(alg, key, iv);  
  // cipher.setAutoPadding(autoPad)  //default true  
  // var ciph = cipher.update(plaintext, 'utf8', 'hex');  
  // ciph += cipher.final('hex');  
  // console.log(alg, ciph)  

  //decrypt  
  var decipher = crypto.createDecipheriv(alg, key, iv);  
  decipher.setAutoPadding(autoPad)  
  var txt = decipher.update(plaintext, 'hex', 'utf8');
  txt += decipher.final('utf8');  
  console.log("this is txt")    
  console.log(txt);
  return txt;
} 
module.exports.encrypt = function(param){
  var key = new Buffer(param.key);  
  var iv = new Buffer(param.iv ? param.iv : 0)  
  var plaintext = param.plaintext  
  var alg = param.alg  
  var autoPad = param.autoPad  
  var cipher = crypto.createCipheriv(alg, key, iv);  
  cipher.setAutoPadding(autoPad)  //default true  
  var ciph = cipher.update(plaintext, 'utf8', 'hex');  
  ciph += cipher.final('hex');  
  return ciph;
}
module.exports.des = {
    algorithm:{ ecb:'des-ecb',cbc:'des-cbc' },
    encrypt:function(plaintext,iv,key){
      var key = new Buffer(key);
      var iv = new Buffer(iv ? iv : 0);
      var cipher = crypto.createCipheriv(this.algorithm.ecb, key, iv);
      cipher.setAutoPadding(true) //default true
      var ciph = cipher.update(plaintext, 'utf8', 'base64');
      ciph += cipher.final('base64');
      return ciph;
    },
    decrypt:function(encrypt_text,iv,key){
      var key = new Buffer(key);
      var iv = new Buffer(iv ? iv : 0);
      var decipher = crypto.createDecipheriv(this.algorithm.ecb, key, iv);
      decipher.setAutoPadding(true);
      var txt = decipher.update(encrypt_text, 'base64', 'utf8');
      txt += decipher.final('utf8');
      return txt;
    }
   
  };

module.exports.encode = function(options) {
  assert.ok(options.payload, 'payload required')
  assert.ok(options.secret, 'secret required')

  var header = {
    alg: 'HS256'
  }

  if (options.header) {
    header = _.merge(header, options.header)
  }

  return jws.sign({
    header: header
  , payload: options.payload
  , secret: options.secret
  })
}

module.exports.decode = function(payload, secret) {
  if (!jws.verify(payload, 'HS256', secret)) {
    return null
  }

  var decoded = jws.decode(payload, {
        json: true
      })
  var exp = decoded.header.exp

  if (exp && exp <= Date.now()) {
    return null
  }

  return decoded.payload
}
module.exports.searchUcode = function(device) {
  request.post({url:`${baseUrl}/stf/findPhoneBySerial`, form:{serial: device.serial}}, function(error, response, body) {
    if(!error) {
      var phoneMessage = JSON.parse(body)
      if(phoneMessage.appoint == 2) {
        device.stfAppoint = phoneMessage.stfAppoint
      }
      device.brandPhone= phoneMessage.phoneSelect.brand;
      device.phoneType = phoneMessage.phoneSelect.phoneType;
      device.assetNumbers = phoneMessage.phoneSelect.assetNumbers;
      device.deviceModel= phoneMessage.phoneSelect.deviceModel;
      device.screenSize= phoneMessage.phoneSelect.phoneSize;
      device.resolvingPower= phoneMessage.phoneSelect.resolution;
      device.sysVer= phoneMessage.phoneSelect.phoneVersion;
      device.equipmentType= phoneMessage.phoneSelect.equipmentType;
    } else {
      console.log("error");
      console.log(error);
      res.render('error', { error: err });
    }
  })
}

module.exports.getCaption = function (obj,state) {
  var index=obj.lastIndexOf("\@");
  if(state==0){
  obj=obj.substring(0,index);
  }else {
  obj=obj.substring(index+1,obj.length);
  }
  return obj;
  }
module.exports.transTime = function (time) {
  var d = new Date(time.toString());
  var transtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours().toString().padStart(2, "0") + ':' + d.getMinutes().toString().padStart(2, "0");
  return transtime;
}

module.exports.transTimeYear = function (time) {
  var d = new Date(time.toString());
  var transtime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  return transtime;
}
module.exports.transTimeHour = function (time) {
  var d = new Date(time.toString());
  var transtime = d.getHours().toString().padStart(2, "0") + ':' + d.getMinutes().toString().padStart(2, "0");
  return transtime;
}
module.exports.time_range = function (beginTime, endTime, nowTime) {
  var strb = beginTime.split (":");
  if (strb.length != 2) {
    return false;
  }
 
  var stre = endTime.split (":");
  if (stre.length != 2) {
    return false;
  }
 
  var strn = nowTime.split (":");
  if (stre.length != 2) {
    return false;
  }
  var b = new Date ();
  var e = new Date ();
  var n = new Date ();
 
  b.setHours (strb[0]);
  b.setMinutes (strb[1]);
  e.setHours (stre[0]);
  e.setMinutes (stre[1]);
  n.setHours (strn[0]);
  n.setMinutes (strn[1]);
 
  if (n.getTime () - b.getTime () > 0 && n.getTime () - e.getTime () < 0) {
    return true;
  } else {
    return false;
  }
}
module.exports.getCookie = function (cookieName ,cookie) {
  //获取所有的cookie "psw=1234we; rememberme=true; user=Annie"
  var totalCookie = cookie;
  //获取参数所在的位置
  var cookieStartAt = totalCookie.indexOf(cookieName + "=");
  //判断参数是否存在 不存在直接返回
  if (cookieStartAt == -1) {
      return;
  }
  //获取参数值的开始位置
  var valueStartAt = totalCookie.indexOf("=", cookieStartAt) + 1;
  //以;来获取参数值的结束位置
  var valueEndAt = totalCookie.indexOf(";", cookieStartAt);
  //如果没有;则是最后一位
  if (valueEndAt == -1) {
      valueEndAt = totalCookie.length;
  }
  //截取参数值的字符串
  var cookieValue = unescape(totalCookie.substring(valueStartAt, valueEndAt));
  return cookieValue;
}
